import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { OappMock } from "../target/types/oapp_mock";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAssociatedTokenAccount, getAssociatedTokenAddressSync, mintTo, getAccount } from "@solana/spl-token";
import { assert } from "chai";
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';

describe("oapp_mock", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local(undefined, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  })
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet

  const OAppMockProgram = anchor.workspace.OappMock as Program<OappMock>;

  // OAPP Peer
  const peerAddress = hexToBytes('0x42532863dcC16164B515C10eb2e46a3630A47762');
  const dstEid: number = 40231;

  it('oapp_send', async () => {
    const tx = await OAppMockProgram.methods.oappSend({
      dstEid: dstEid,
      to: Array.from(peerAddress),
      options: Buffer.from("fake options"),
      message: Buffer.from("hello world"),
      nativeFee: new BN(100_000_000),
      lzTokenFee: new BN(0),
    }).accounts({
      signer: wallet.publicKey
    }).signers([wallet.payer]).rpc();

    console.log("send oapp, tx", tx);
  });
});