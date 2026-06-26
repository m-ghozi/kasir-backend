import { vi, describe, it, expect, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  tx: {
    product: { findUnique: vi.fn(), update: vi.fn() },
    stockOut: { create: vi.fn() },
  },
}));

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    $transaction: (cb: any) => cb(mocks.tx),
  },
}));

import { stockService } from '../../src/services/stock.service';

const { tx } = mocks;

beforeEach(() => {
  vi.clearAllMocks();
  tx.stockOut.create.mockResolvedValue({ id: 1 });
  tx.product.update.mockResolvedValue({});
});

describe('createStockOut', () => {
  it('stok kurang → throw', async () => {
    tx.product.findUnique.mockResolvedValue({ id: 1, stock: 1 });
    await expect(
      stockService.createStockOut({ productId: 1, quantity: 5 }, 1)
    ).rejects.toThrow('tidak mencukupi');
    expect(tx.product.update).not.toHaveBeenCalled();
  });

  it('produk tidak ada → throw', async () => {
    tx.product.findUnique.mockResolvedValue(null);
    await expect(
      stockService.createStockOut({ productId: 1, quantity: 1 }, 1)
    ).rejects.toThrow('tidak mencukupi');
  });

  it('stok cukup → buat record & decrement', async () => {
    tx.product.findUnique.mockResolvedValue({ id: 1, stock: 10 });
    await stockService.createStockOut({ productId: 1, quantity: 3, reason: 'rusak' }, 7);

    expect(tx.stockOut.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ productId: 1, quantity: 3, createdById: 7 }) })
    );
    expect(tx.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stock: { decrement: 3 } } })
    );
  });
});
