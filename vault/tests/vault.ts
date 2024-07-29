import { join } from "path";
import { readFileSync } from "fs";
import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import {
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    SendTransactionError
} from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, createMint, createAssociatedTokenAccount, getAssociatedTokenAddressSync, mintTo, getAccount } from "@solana/spl-token";
import { assert, expect } from "chai";

describe("vault", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    const connection = provider.connection;
    anchor.setProvider(provider);

    const program = anchor.workspace.Vault as Program<Vault>;

    const admin = Keypair.generate();

    const user = Keypair.generate();
    const [pda] = PublicKey.findProgramAddressSync(
        [user.publicKey.toBuffer()],
        program.programId
    );

    let token: PublicKey;
    let vaultDepositAuthority: PublicKey;
    let vaultTokenAccount: PublicKey;
    let userTokenAccount: PublicKey;

    before(async () => {
        const latestBlockHash = await connection.getLatestBlockhash();

        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: await connection.requestAirdrop(
                user.publicKey,
                10 * LAMPORTS_PER_SOL
            )
        }
        );

        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: await connection.requestAirdrop(
                admin.publicKey,
                10 * LAMPORTS_PER_SOL
            )
        }
        );

        token = await createMint(
            connection,
            admin,
            admin.publicKey,
            null,
            6
        );

        [vaultDepositAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault_deposit_authority"), token.toBuffer()],
            program.programId
        );

        vaultTokenAccount = getAssociatedTokenAddressSync(token, vaultDepositAuthority, true);
        userTokenAccount = await createAssociatedTokenAccount(connection, admin, token, user.publicKey);
        await mintTo(connection, admin, token, userTokenAccount, admin, 1e10);

        // console.log("Admin address", admin.publicKey.toBase58());
        // console.log("User address", user.publicKey.toBase58());
        // console.log("Program ID", program.programId.toBase58());
        // console.log("PDA", pda.toBase58());
        // console.log("Token address", token.toBase58());
        // console.log("Vault deposit authority", vaultDepositAuthority.toBase58());
        // console.log("Vault token account", vaultTokenAccount.toBase58());
        // console.log("User token account", userTokenAccount.toBase58());
        // const userTokenAccountInfo = await getAccount(connection, userTokenAccount);
        // console.log("User token account amount", userTokenAccountInfo.amount.toString());
    });

    it("initialize", async () => {
        const tx = await program.methods.initialize().accounts({
            depositToken: token,
            vaultDepositAuthority,
            user: user.publicKey,
        }).signers([user]).rpc();
        console.log("Initialize transaction signature", tx);

        try {
            await program.methods.initialize().accounts({
                depositToken: token,
                vaultDepositAuthority,
                user: user.publicKey,
            }).signers([user]).rpc();
            assert.fail("Should have thrown an error");
        } catch (error) {
        }
    });

    it("deposit", async () => {
        const userTokenAccountBefore = await getAccount(connection, userTokenAccount);
        assert.strictEqual(userTokenAccountBefore.amount.toString(), "10000000000");

        const tx = await program.methods.deposit(new BN(5e9)).accounts({
            userInfo: pda,
            userDepositWallet: userTokenAccount,
            vaultDepositAuthority: vaultDepositAuthority,
            vaultDepositWallet: vaultTokenAccount,
            depositToken: token,
            user: user.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).signers([user]).rpc();
        // console.log("Deposit transaction signature", tx);

        const vaultTokenAccountAfter1 = await getAccount(connection, vaultTokenAccount);
        assert.strictEqual(vaultTokenAccountAfter1.amount.toString(), "5000000000");

        const userTokenAccountAfter1 = await getAccount(connection, userTokenAccount);
        assert.strictEqual(userTokenAccountAfter1.amount.toString(), "5000000000");

        const userInfoAfter1 = await program.account.userInfo.fetch(pda);
        assert.strictEqual(userInfoAfter1.amount.toNumber(), 5000000000);

        const tx2 = await program.methods.deposit(new BN(5e9)).accounts({
            userInfo: pda,
            userDepositWallet: userTokenAccount,
            vaultDepositAuthority: vaultDepositAuthority,
            vaultDepositWallet: vaultTokenAccount,
            depositToken: token,
            user: user.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).signers([user]).rpc();
        // console.log("Deposit transaction signature 2", tx2);

        const vaultTokenAccountAfter2 = await getAccount(connection, vaultTokenAccount);
        assert.strictEqual(vaultTokenAccountAfter2.amount.toString(), "10000000000");

        const userTokenAccountAfter2 = await getAccount(connection, userTokenAccount);
        assert.strictEqual(userTokenAccountAfter2.amount.toString(), "0");

        const userInfoAfter2 = await program.account.userInfo.fetch(pda);
        assert.strictEqual(userInfoAfter2.amount.toNumber(), 1e10);
    });

    it("withdraw", async () => {
        const userTokenAccountBefore = await getAccount(connection, userTokenAccount);
        assert.strictEqual(userTokenAccountBefore.amount.toString(), "0");

        const tx = await program.methods.withdraw(new BN(1e10)).accounts({
            user: user.publicKey,
            userInfo: pda,
            userDepositWallet: userTokenAccount,
            vaultDepositAuthority: vaultDepositAuthority,
            vaultDepositWallet: vaultTokenAccount,
            depositToken: token,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc();
        // console.log("Withdraw transaction signature", tx);

        const vaultTokenAccountAfter = await getAccount(connection, vaultTokenAccount);
        assert.strictEqual(vaultTokenAccountAfter.amount.toString(), "0");

        const userTokenAccountAfter = await getAccount(connection, userTokenAccount);
        assert.strictEqual(userTokenAccountAfter.amount.toString(), "10000000000");

        const userInfoAfter = await program.account.userInfo.fetch(pda);
        assert.strictEqual(userInfoAfter.amount.toNumber(), 0);
    });
});
