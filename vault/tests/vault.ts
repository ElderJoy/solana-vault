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
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { assert, expect } from "chai";

describe("vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  const program = anchor.workspace.Vault as Program<Vault>;

  const WALLET_PATH = join(process.env["HOME"]!, ".config/solana/id.json");
  const admin = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(readFileSync(WALLET_PATH, { encoding: "utf-8" })))
  );

  const user = Keypair.generate();
  const [pda] = PublicKey.findProgramAddressSync(
    [user.publicKey.toBuffer()],
    program.programId
  );

  let token: Token;
  let adminTokenAccount: PublicKey;
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

    token = await Token.createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      9,
      TOKEN_PROGRAM_ID
    );

    adminTokenAccount = await token.createAccount(admin.publicKey);
    userTokenAccount = await token.createAccount(user.publicKey);

    await token.mintTo(userTokenAccount, admin.publicKey, [admin], 1e10);
  });

  it("initialize", async () => {
    const tx = await program.methods.initialize().accounts({
      user: user.publicKey,
      userInfo: pda,
    }).signers([user]).rpc();
    console.log("Initialize transaction signature", tx);

    // should fail
    try {
      await program.methods.initialize().accounts({
        user: user.publicKey,
        userInfo: pda,
      }).signers([user]).rpc();
      assert.ok(false);
    } catch (e) {
    }
  });

  it("deposit", async () => {
    const userTokenAccountBefore = await token.getAccountInfo(userTokenAccount);
    assert.strictEqual(userTokenAccountBefore.amount.toNumber(), 1e10);

    const tx = await program.methods.deposit(new BN(5e9)).accounts({
      user: user.publicKey,
      admin: admin.publicKey,
      userInfo: pda,
      userDepositWallet: userTokenAccount,
      adminDepositWallet: adminTokenAccount,
      depositToken: token.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([user]).rpc();
    console.log("Deposit transaction signature", tx);

    const adminTokenAccountAfter1 = await token.getAccountInfo(adminTokenAccount);
    assert.strictEqual(adminTokenAccountAfter1.amount.toNumber(), 5e9);

    const userTokenAccountAfter1 = await token.getAccountInfo(userTokenAccount);
    assert.strictEqual(userTokenAccountAfter1.amount.toNumber(), 5e9);

    const userInfoAfter1 = await program.account.userInfo.fetch(pda);
    assert.strictEqual(userInfoAfter1.amount.toNumber(), 5e9);

    const tx2 = await program.methods.deposit(new BN(5e9)).accounts({
      user: user.publicKey,
      admin: admin.publicKey,
      userInfo: pda,
      userDepositWallet: userTokenAccount,
      adminDepositWallet: adminTokenAccount,
      depositToken: token.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([user]).rpc();
    console.log("Deposit transaction signature 2", tx2);

    const adminTokenAccountAfter2 = await token.getAccountInfo(adminTokenAccount);
    assert.strictEqual(adminTokenAccountAfter2.amount.toNumber(), 1e10);

    const userTokenAccountAfter2 = await token.getAccountInfo(userTokenAccount);
    assert.strictEqual(userTokenAccountAfter2.amount.toNumber(), 0);

    const userInfoAfter2 = await program.account.userInfo.fetch(pda);
    assert.strictEqual(userInfoAfter2.amount.toNumber(), 1e10);
  });

  it("withdraw", async () => {
    const userTokenAccountBefore = await token.getAccountInfo(userTokenAccount);
    assert.strictEqual(userTokenAccountBefore.amount.toNumber(), 0);

    const tx = await program.methods.withdraw(new BN(1e10)).accounts({
      user: user.publicKey,
      admin: admin.publicKey,
      userInfo: pda,
      userDepositWallet: userTokenAccount,
      adminDepositWallet: adminTokenAccount,
      depositToken: token.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();
    console.log("Withdraw transaction signature", tx);

    const adminTokenAccountAfter = await token.getAccountInfo(adminTokenAccount);
    assert.strictEqual(adminTokenAccountAfter.amount.toNumber(), 0);

    const userTokenAccountAfter = await token.getAccountInfo(userTokenAccount);
    assert.strictEqual(userTokenAccountAfter.amount.toNumber(), 1e10);

    const userInfoAfter = await program.account.userInfo.fetch(pda);
    assert.strictEqual(userInfoAfter.amount.toNumber(), 0);
  });
});
