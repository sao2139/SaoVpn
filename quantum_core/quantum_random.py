
import numpy as np
import secrets
import json
import sys

H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)

KET_0 = np.array([1, 0], dtype=complex)

def colapsar_qubit(semilla_offset=0):

    estado = KET_0.copy()

    estado = H @ estado

    prob_1 = np.abs(estado[1]) ** 2

    r = secrets.randbelow(10**9) / 10**9
    return 1 if r < prob_1 else 0

def generar_bytes_cuanticos(n_bytes=32):

    n_bits = n_bytes * 8
    bits = [colapsar_qubit(i) for i in range(n_bits)]

    H2 = np.kron(H, H)  
    estado_2q = H2 @ np.array([1, 0, 0, 0], dtype=complex)  
    muestra_onda = [f"{amp.real:.4f}{amp.imag:+.4f}j" for amp in estado_2q]

    hex_result = ''
    for i in range(0, len(bits), 8):
        byte_bits = bits[i:i+8]
        byte_val = sum(b << (7 - j) for j, b in enumerate(byte_bits))
        hex_result += format(byte_val, '02x')

    return {
        "status": "success",
        "hex": hex_result,
        "bytes": n_bytes,
        "bits": n_bits,
        "qubits_used": n_bits,
        "source": "hadamard_wavefunction_collapse",
        "wave_sample": muestra_onda,
        "gate": "H = (1/√2)[[1,1],[1,-1]]",
        "physics": "Born_Rule_P(|1⟩)=|β|²"
    }

if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 32
    n = min(n, 256)
    sys.stdout.write(json.dumps(generar_bytes_cuanticos(n)))
    sys.stdout.flush()
