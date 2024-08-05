import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { OrderlyOapp } from "../target/types/orderly_oapp";
import { hexToBytes } from 'ethereum-cryptography/utils';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import { ENDPOINT_SEED, ENFORCED_OPTIONS_SEED, EVENT_SEED, LZ_RECEIVE_TYPES_SEED, MESSAGE_LIB_SEED, NONCE_SEED, OAPP_SEED, OftTools, PEER_SEED, SEND_CONFIG_SEED, SEND_LIBRARY_CONFIG_SEED, ULN_SEED } from '@layerzerolabs/lz-solana-sdk-v2'
import { addressToBytes32, Options } from '@layerzerolabs/lz-v2-utilities'

describe("orderly_oapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local(undefined, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  })
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet

  const OAppMockProgram = anchor.workspace.OrderlyOapp as Program<OrderlyOapp>;
  const OAPP_PROGRAM_ID = OAppMockProgram.programId;

  // Endpoint program id
  const ENDPOINT_PROGRAM_ID = new PublicKey("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6")
  // Send library program id
  const SEND_LIB_PROGRAM_ID = new PublicKey("7a4WjyR8VZ7yZz5XJAKm39BUGn5iT9CKcv2pmG9tdXVH")

  // OAPP Config PDA
  const [oappConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(OAPP_SEED, 'utf8')],
    OAPP_PROGRAM_ID
  )
  console.log('oappConfigPda:', oappConfigPda.toBase58())

  // OAPP Peer
  const peerAddress = hexToBytes('0x42532863dcC16164B515C10eb2e46a3630A47762');
  const dstEid: number = 40231;
  const bufferDstEid = Buffer.alloc(4)
  bufferDstEid.writeUInt32BE(dstEid)

  const [eventAuthorityPubkey] = PublicKey.findProgramAddressSync(
    [Buffer.from(EVENT_SEED)], ENDPOINT_PROGRAM_ID
  )
  console.log('eventAuthorityPubkey:', eventAuthorityPubkey.toBase58())

  const [ulnEventAuthorityPubkey] = PublicKey.findProgramAddressSync(
    [Buffer.from(EVENT_SEED)], SEND_LIB_PROGRAM_ID
  )
  console.log('ulnEventAuthorityPubkey:', ulnEventAuthorityPubkey.toBase58())

  const [sendLibConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEND_LIBRARY_CONFIG_SEED), oappConfigPda.toBuffer(), bufferDstEid],
    ENDPOINT_PROGRAM_ID
  );
  console.log('sendLibConfigPda:', sendLibConfigPda.toBase58())

  const [defaultSendLibConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEND_LIBRARY_CONFIG_SEED), bufferDstEid],
    ENDPOINT_PROGRAM_ID
  );
  console.log('defaultSendLibConfigPda:', defaultSendLibConfigPda.toBase58())

  const [sendLibPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(MESSAGE_LIB_SEED)],
    SEND_LIB_PROGRAM_ID
  );

  const [sendLibInfoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(MESSAGE_LIB_SEED, 'utf-8'), sendLibPda.toBuffer()],
    ENDPOINT_PROGRAM_ID
  );
  console.log('sendLibInfoPda:', sendLibInfoPda.toBase58())

  const [endpointSettingPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(ENDPOINT_SEED)],
    ENDPOINT_PROGRAM_ID
  );
  console.log('endpointSettingPda:', endpointSettingPda.toBase58())

  const [noncePda] = PublicKey.findProgramAddressSync(
    [Buffer.from(NONCE_SEED), oappConfigPda.toBuffer(), bufferDstEid, peerAddress],
    ENDPOINT_PROGRAM_ID
  );
  console.log('noncePda:', noncePda.toBase58())

  const [ulnSettingPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(ULN_SEED)],
    SEND_LIB_PROGRAM_ID
  );
  console.log('ulnSettingPda:', ulnSettingPda.toBase58())

  const [sendConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEND_CONFIG_SEED), bufferDstEid, oappConfigPda.toBuffer()],
    SEND_LIB_PROGRAM_ID
  );
  console.log('sendConfigPda:', sendConfigPda.toBase58())

  const [defaultSendConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEND_CONFIG_SEED), bufferDstEid],
    SEND_LIB_PROGRAM_ID
  );
  console.log('defaultSendConfigPda:', defaultSendConfigPda.toBase58())

  const treasuryPubkey = new PublicKey('7a4WjyR8VZ7yZz5XJAKm39BUGn5iT9CKcv2pmG9tdXVH')

  const executorPubkey = new PublicKey('6doghB248px58JSSwG4qejQ46kFMW4AMj7vzJnWZHNZn')

  const executorConfigPubkey = new PublicKey('AwrbHeCyniXaQhiJZkLhgWdUCteeWSGaSN1sTfLiY7xK')

  const priceFeedPubkey = new PublicKey('8ahPGPjEbpgGaZx2NV1iG5Shj7TDwvsjkEDcGWjt94TP')

  const priceFeedConfigPubkey = new PublicKey('CSFsUupvJEQQd1F4SsXGACJaxQX4eropQMkGV2696eeQ')

  const dvnPubkey = new PublicKey('HtEYV4xB4wvsj5fgTkcfuChYpvGYzgzwvNhgDZQNh7wW')

  const dvnConfigPubkey = new PublicKey('4VDjp6XQaxoZf5RGwiPU9NR1EXSZn2TP4ATMmiSzLfhb')

  it('oapp_send', async () => {
    const tx = await OAppMockProgram.methods.oappSend({
      dstEid: dstEid,
      to: Array.from(peerAddress),
      options: Buffer.from(Options.newOptions().addExecutorLzReceiveOption(500000, 0).toBytes()),
      message: Buffer.from("hello world"),
      nativeFee: new BN(100_000_000),
      lzTokenFee: new BN(0),
    }).accounts({
      signer: wallet.publicKey
    }).remainingAccounts([
      {
        isSigner: false,
        isWritable: false,
        pubkey: ENDPOINT_PROGRAM_ID,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: oappConfigPda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SEND_LIB_PROGRAM_ID
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: sendLibConfigPda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: defaultSendLibConfigPda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: sendLibInfoPda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: endpointSettingPda,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: noncePda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: eventAuthorityPubkey,
      },
      // ULN solana/programs/programs/uln/src/instructions/endpoint/send.rs
      {
        isSigner: false,
        isWritable: false,
        pubkey: ENDPOINT_PROGRAM_ID,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: ulnSettingPda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: sendConfigPda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: defaultSendConfigPda,
      },
      {
        isSigner: true,
        isWritable: false,
        pubkey: wallet.publicKey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: treasuryPubkey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SystemProgram.programId,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: ulnEventAuthorityPubkey
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SEND_LIB_PROGRAM_ID
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: executorPubkey
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: executorConfigPubkey
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: priceFeedPubkey
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: priceFeedConfigPubkey
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: dvnPubkey
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dvnConfigPubkey
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: priceFeedPubkey
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: priceFeedConfigPubkey
      }
    ]).signers([wallet.payer]).rpc();

    console.log("send oapp, tx", tx);
  });
});