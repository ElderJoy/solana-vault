import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { OrderlyOapp } from "../target/types/orderly_oapp";
import { hexToBytes } from 'ethereum-cryptography/utils';

describe("orderly_oapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local(undefined, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  })
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet

  const OAppMockProgram = anchor.workspace.OrderlyOapp as Program<OrderlyOapp>;

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