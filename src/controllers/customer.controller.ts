import { Request, Response } from 'express';
import { customerService } from '../services/customer.service';

export const customerController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const search = req.query.search as string | undefined;
      const customers = await customerService.getAllCustomers(search);
      res.json({ success: true, data: customers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const customer = await customerService.getCustomerById(id);

      if (!customer) {
        res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan' });
        return;
      }

      res.json({ success: true, data: customer });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, phone, email, address, notes } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: 'Nama pelanggan wajib diisi!' });
        return;
      }

      const newCustomer = await customerService.createCustomer({ name, phone, email, address, notes });
      res.status(201).json({ success: true, message: 'Pelanggan berhasil ditambahkan', data: newCustomer });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);

      const existing = await customerService.getCustomerById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan' });
        return;
      }

      const updatedCustomer = await customerService.updateCustomer(id, req.body);
      res.json({ success: true, message: 'Pelanggan berhasil diubah', data: updatedCustomer });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);

      const existing = await customerService.getCustomerById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan' });
        return;
      }

      await customerService.deleteCustomer(id);
      res.json({ success: true, message: 'Pelanggan berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getTransactions: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);

      const existing = await customerService.getCustomerById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan' });
        return;
      }

      const [transactions, summary] = await Promise.all([
        customerService.getCustomerTransactions(id),
        customerService.getCustomerSummary(id),
      ]);

      res.json({ success: true, data: { customer: existing, summary, transactions } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};