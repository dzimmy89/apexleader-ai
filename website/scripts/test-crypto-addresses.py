#!/usr/bin/env python3
"""Check the coaching receive addresses shown on /coaching/pay.

The addresses below are pinned copies of the ones on the DeFi University pay
page (same wallets, confirmed by the owner). The script fails when
content/crypto-payments.ts no longer matches them, or when a checksum fails.
"""

import re
import sys
from pathlib import Path

EVM = "0x356aa473344c07F650eb3a2C5Bd7D8A261aDe6e1"
SOLANA = "jknKFWNNok4oB2yabhybMrdvmRtwgZsWRXf7yNToxqM"
BITCOIN = "bc1q5rrkxtsshz5q9dzu0uurnn50e4jwse6fvfdu6c"

BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def keccak256(data: bytes) -> bytes:
    from Crypto.Hash import keccak

    digest = keccak.new(digest_bits=256)
    digest.update(data)
    return digest.digest()


def eip55(addr: str) -> str:
    raw = addr.lower().removeprefix("0x")
    hashed = keccak256(raw.encode()).hex()
    out = "0x"
    for char, nibble in zip(raw, hashed):
        out += char.upper() if char.isalpha() and int(nibble, 16) >= 8 else char
    return out


def b58decode(value: str) -> bytes:
    number = 0
    for char in value:
        number = number * 58 + BASE58_ALPHABET.index(char)
    pad = 0
    for char in value:
        if char != "1":
            break
        pad += 1
    body = number.to_bytes((number.bit_length() + 7) // 8, "big") if number else b""
    return b"\x00" * pad + body


def bech32_polymod(values: list[int]) -> int:
    generators = [0x3B6A57B2, 0x26508E6D, 0x1EA119FA, 0x3D4233DD, 0x2A1462B3]
    checksum = 1
    for value in values:
        top = checksum >> 25
        checksum = ((checksum & 0x1FFFFFF) << 5) ^ value
        for index in range(5):
            if (top >> index) & 1:
                checksum ^= generators[index]
    return checksum


def bech32_ok(addr: str) -> bool:
    if addr.lower() != addr:
        return False
    split = addr.rfind("1")
    if split < 1:
        return False
    hrp, data = addr[:split], addr[split + 1 :]
    decoded = [BECH32_CHARSET.find(char) for char in data]
    if any(item < 0 for item in decoded):
        return False
    expanded = [ord(char) >> 5 for char in hrp] + [0] + [ord(char) & 31 for char in hrp]
    return bech32_polymod(expanded + decoded) == 1


def addresses_in_site_file() -> dict[str, str]:
    path = Path(__file__).resolve().parent.parent / "content" / "crypto-payments.ts"
    text = path.read_text(encoding="utf-8")
    found: dict[str, str] = {}
    for network, address in re.findall(
        r'network:\s*"(evm|solana|bitcoin)".*?address:\s*"([^"]+)"', text, flags=re.S
    ):
        found[network] = address
    return found


def main() -> int:
    failed = False
    pinned = {"evm": EVM, "solana": SOLANA, "bitcoin": BITCOIN}
    site = addresses_in_site_file()
    for network, address in pinned.items():
        if site.get(network) != address:
            print(f"{network} address in content/crypto-payments.ts does not match the pinned address")
            failed = True
    if set(site) != set(pinned):
        print(f"Unexpected networks in content/crypto-payments.ts: {sorted(site)}")
        failed = True
    if not failed:
        print("Site file matches the pinned addresses")
    checksum = eip55(EVM)
    if checksum != EVM:
        print(f"EVM checksum mismatch: {checksum}")
        failed = True
    else:
        print("EVM checksum ok")

    try:
        decoded = b58decode(SOLANA)
    except ValueError:
        print("Solana address is not base58")
        failed = True
    else:
        if len(decoded) != 32:
            print(f"Solana decoded length {len(decoded)}, expected 32")
            failed = True
        else:
            print("Solana address ok")

    if not bech32_ok(BITCOIN):
        print("Bitcoin bech32 checksum failed")
        failed = True
    else:
        print("Bitcoin address ok")

    return 1 if failed else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except ModuleNotFoundError:
        # pycryptodome is optional; fall back to hashlib if a keccak is unavailable.
        print("pycryptodome is required for the EIP-55 check (pip install pycryptodome)")
        sys.exit(1)
