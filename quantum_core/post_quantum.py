"""
post_quantum.py — Criptografía Post-Cuántica basada en Learning With Errors (LWE).
Implementa un esquema de cifrado/descifrado resistente a ataques cuánticos
usando retículos (lattices), similar a los fundamentos de CRYSTALS-Kyber.

Uso:
  python post_quantum.py keygen            → genera par de llaves
  python post_quantum.py encrypt <pubkey_json> <mensaje>  → cifra
  python post_quantum.py decrypt <privkey_json> <ciphertext_json>  → descifra
"""
import numpy as np
import json
import sys
import secrets


# Parámetros del esquema LWE
N = 256          # Dimensión del retículo
Q = 7681         # Módulo primo (compatible con NTT)
SIGMA = 3.2      # Distribución del error gaussiano


def _seed_rng():
    """Semilla con entropía del hardware."""
    np.random.seed(secrets.randbits(32))


def generar_error(size):
    """Genera vector de error con distribución gaussiana discreta."""
    return np.round(np.random.normal(0, SIGMA, size)).astype(int) % Q


def keygen():
    """Genera par de llaves LWE (pública y privada)."""
    _seed_rng()

    # Llave privada: vector secreto s ∈ Z_q^n
    s = np.random.randint(0, Q, size=N)

    # Matriz pública A ∈ Z_q^(n x n)
    A = np.random.randint(0, Q, size=(N, N))

    # Error e ∈ Z_q^n
    e = generar_error(N)

    # Llave pública: b = A·s + e (mod q)
    b = (A @ s + e) % Q

    pubkey = {
        "A": A.tolist(),
        "b": b.tolist()
    }
    privkey = {
        "s": s.tolist()
    }

    return {
        "status": "success",
        "public_key": pubkey,
        "private_key": privkey,
        "params": {"n": N, "q": Q, "sigma": SIGMA},
        "algorithm": "LWE-256 (Post-Quantum Lattice)"
    }


def encrypt(pubkey, mensaje):
    """Cifra un mensaje (string) usando la llave pública LWE."""
    _seed_rng()

    A = np.array(pubkey["A"])
    b = np.array(pubkey["b"])

    # Convertir mensaje a bits
    msg_bytes = mensaje.encode('utf-8')
    msg_bits = []
    for byte in msg_bytes:
        for i in range(7, -1, -1):
            msg_bits.append((byte >> i) & 1)

    # Cifrar bit por bit
    ciphertext = []
    for bit in msg_bits:
        # Vector aleatorio r ∈ {0,1}^n (selección de filas)
        r = np.random.randint(0, 2, size=N)

        # u = A^T · r (mod q)
        u = (A.T @ r) % Q

        # v = b · r + bit · ⌊q/2⌋ (mod q)
        v = (int(np.dot(b, r)) + bit * (Q // 2)) % Q

        ciphertext.append({
            "u": u.tolist(),
            "v": int(v)
        })

    return {
        "status": "success",
        "ciphertext": ciphertext,
        "original_length": len(msg_bytes),
        "bits_encrypted": len(msg_bits),
        "algorithm": "LWE-256 (Post-Quantum)"
    }


def decrypt(privkey, ciphertext_data):
    """Descifra usando la llave privada LWE."""
    s = np.array(privkey["s"])

    msg_bits = []
    for ct in ciphertext_data:
        u = np.array(ct["u"])
        v = ct["v"]

        # Descifrar: d = v - s·u (mod q)
        d = (v - int(np.dot(s, u))) % Q

        # Si d está más cerca de q/2, el bit es 1; si está cerca de 0, es 0
        if abs(d - Q // 2) < Q // 4:
            msg_bits.append(1)
        else:
            msg_bits.append(0)

    # Convertir bits a bytes
    msg_bytes = []
    for i in range(0, len(msg_bits), 8):
        byte = 0
        for j in range(8):
            if i + j < len(msg_bits):
                byte = (byte << 1) | msg_bits[i + j]
        msg_bytes.append(byte)

    try:
        mensaje = bytes(msg_bytes).decode('utf-8').rstrip('\x00')
    except:
        mensaje = bytes(msg_bytes).hex()

    return {
        "status": "success",
        "message": mensaje,
        "bits_decrypted": len(msg_bits)
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "uso: keygen | encrypt | decrypt"}))
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "keygen":
        result = keygen()

    elif cmd == "encrypt":
        pubkey = json.loads(sys.argv[2])
        mensaje = sys.argv[3]
        result = encrypt(pubkey, mensaje)

    elif cmd == "decrypt":
        privkey = json.loads(sys.argv[2])
        ciphertext = json.loads(sys.argv[3])
        result = decrypt(privkey, ciphertext)

    else:
        result = {"status": "error", "message": f"comando desconocido: {cmd}"}

    sys.stdout.write(json.dumps(result))
    sys.stdout.flush()
