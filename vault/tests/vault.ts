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
import { assert } from "chai";

describe("vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Vault as Program<Vault>;

  const WALLET_PATH = join(process.env["HOME"]!, ".config/solana/id.json");
  const admin = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(readFileSync(WALLET_PATH, { encoding: "utf-8" })))
  );

  const user = Keypair.generate();
  const userInfo = Keypair.generate();

  let token: Token;
  let adminTokenAccount: PublicKey;
  let userTokenAccount: PublicKey;

  before(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        user.publicKey,
        10 * LAMPORTS_PER_SOL
      ),
      "confirmed"
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

  it("deposit", async () => {
    const userTokenAccountBefore = await token.getAccountInfo(userTokenAccount);
    assert.strictEqual(userTokenAccountBefore.amount.toNumber(), 1e10);

    const tx = await program.methods.deposit(new BN(1e10)).accounts({
      user: user.publicKey,
      admin: admin.publicKey,
      userInfo: userInfo.publicKey,
      userDepositWallet: userTokenAccount,
      adminDepositWallet: adminTokenAccount,
      depositToken: token.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([user, userInfo]).rpc();
    console.log("Deposit transaction signature", tx);

    const adminTokenAccountAfter = await token.getAccountInfo(adminTokenAccount);
    assert.strictEqual(adminTokenAccountAfter.amount.toNumber(), 1e10);

    const userTokenAccountAfter = await token.getAccountInfo(userTokenAccount);
    assert.strictEqual(userTokenAccountAfter.amount.toNumber(), 0);

    const userInfoAfter = await program.account.userInfo.fetch(userInfo.publicKey);
    assert.strictEqual(userInfoAfter.amount.toNumber(), 1e10);
  });
});
