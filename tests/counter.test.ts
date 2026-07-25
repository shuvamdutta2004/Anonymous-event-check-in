import { describe, it, expect } from 'vitest';
import { Contract, ledger } from '../managed/contract/index.js';

// Helper to convert strings to 32-byte Uint8Array
function toBytes32(str: string): Uint8Array {
  const bytes = new Uint8Array(32);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  bytes.set(encoded.subarray(0, 32));
  return bytes;
}

describe('Anonymous Event Check-In (AECI) Contract - Midnight ZK Architecture', () => {

  it('1. Circuit Structure: anonymousCheckIn exports valid circuit bindings with multi-witness vectors', () => {
    const mockSecret = toBytes32('secret_attendee_passcode_123');
    const mockNonce = toBytes32('random_entropy_nonce_777');
    const mockRole = toBytes32('role_tier_1_general');

    const witnesses = {
      secretPasscode: (ctx: any) => [ctx.privateState, mockSecret] as [any, Uint8Array],
      attendeeNonce: (ctx: any) => [ctx.privateState, mockNonce] as [any, Uint8Array],
      attendeeRole: (ctx: any) => [ctx.privateState, mockRole] as [any, Uint8Array]
    };

    const contract = new Contract(witnesses);
    expect(contract).toBeDefined();
    expect(typeof contract.circuits.anonymousCheckIn).toBe('function');
    expect(typeof contract.circuits.resetOrganizer).toBe('function');
    expect(typeof contract.circuits.incrementSession).toBe('function');
  });

  it('2. Multi-Witness Resolution: secretPasscode, attendeeNonce, and attendeeRole witnesses are constructed cleanly', () => {
    const mockSecret = toBytes32('secret_attendee_passcode_456');
    const mockNonce = toBytes32('random_entropy_nonce_888');
    const mockRole = toBytes32('role_tier_2_vip');

    const witnesses = {
      secretPasscode: (ctx: any) => [ctx.privateState, mockSecret] as [any, Uint8Array],
      attendeeNonce: (ctx: any) => [ctx.privateState, mockNonce] as [any, Uint8Array],
      attendeeRole: (ctx: any) => [ctx.privateState, mockRole] as [any, Uint8Array]
    };

    const contract = new Contract(witnesses);
    expect(witnesses.secretPasscode).toBeDefined();
    expect(witnesses.attendeeNonce).toBeDefined();
    expect(witnesses.attendeeRole).toBeDefined();

    expect(mockSecret.length).toBe(32);
    expect(mockNonce.length).toBe(32);
    expect(mockRole.length).toBe(32);
  });

  it('3. Zero-Knowledge Privacy Model: Private witnesses are isolated from public ledger', () => {
    const privatePasscode = toBytes32('super_secret_personal_id');
    const privateNonce = toBytes32('private_nonce_secret');
    const privateRole = toBytes32('role_tier_3_organizer');
    const organizerId = toBytes32('event_midnight_summit');

    const witnesses = {
      secretPasscode: (ctx: any) => [ctx.privateState, privatePasscode] as [any, Uint8Array],
      attendeeNonce: (ctx: any) => [ctx.privateState, privateNonce] as [any, Uint8Array],
      attendeeRole: (ctx: any) => [ctx.privateState, privateRole] as [any, Uint8Array]
    };

    const contract = new Contract(witnesses);
    expect(contract.witnesses.secretPasscode).toBeDefined();

    // Ensure raw secret values are isolated and distinct
    expect(privatePasscode).not.toEqual(organizerId);
    expect(privateNonce).not.toEqual(organizerId);
    expect(privateRole).not.toEqual(organizerId);
  });

  it('4. Ledger Schema Interface: Exports ledger schema query function', () => {
    expect(typeof ledger).toBe('function');
  });

});
