
import numpy as np
import json
import sys
import secrets

N = 256          
Q = 7681         
SIGMA = 3.2      

def _seed_rng():

    np.random.seed(secrets.randbits(32))

def generar_error(size):

    return np.round(np.random.normal(0, SIGMA, size)).astype(int) % Q

def keygen():

    _seed_rng()

    s = np.random.randint(0, Q, size=N)

    A = np.random.randint(0, Q, size=(N, N))

    e = generar_error(N)

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

    _seed_rng()

    A = np.array(pubkey["A"])
    b = np.array(pubkey["b"])

    msg_bytes = mensaje.encode('utf-8')
    msg_bits = []
    for byte in msg_bytes:
        for i in range(7, -1, -1):
            msg_bits.append((byte >> i) & 1)

    ciphertext = []
    for bit in msg_bits:

        r = np.random.randint(0, 2, size=N)

        u = (A.T @ r) % Q

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

    s = np.array(privkey["s"])

    msg_bits = []
    for ct in ciphertext_data:
        u = np.array(ct["u"])
        v = ct["v"]

        d = (v - int(np.dot(s, u))) % Q

        if abs(d - Q // 2) < Q // 4:
            msg_bits.append(1)
        else:
            msg_bits.append(0)

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
