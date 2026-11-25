import time

import torch

# Runs once per execution environment, at initialization.
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def handler(event, context):
    """Multiply two matrices on the GPU and report the device that did it."""
    size = int(event.get("size", 4096))
    a = torch.ones(size, size, device=DEVICE)
    b = torch.ones(size, size, device=DEVICE)

    start = time.perf_counter()
    product = a @ b
    if DEVICE.type == "cuda":
        torch.cuda.synchronize()
    elapsed_ms = (time.perf_counter() - start) * 1000

    return {
        "device": torch.cuda.get_device_name(0) if DEVICE.type == "cuda" else "cpu",
        "size": size,
        # Every element of ones(n, n) @ ones(n, n) is n
        "result": int(product[0, 0].item()),
        "milliseconds": round(elapsed_ms, 1),
    }
