import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL, Vault } from "./vault";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const programId = new PublicKey("7u49DKPmZd3M1PtpNishUTjM6EV2yU72AaqN1RSiZBXs");

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Initialize the program interface with the IDL, program ID, and connection.
// This setup allows us to interact with the on-chain program using the defined interface.
export const vaultProgram = new Program<Vault>(IDL, programId, {
  connection,
});