import { Request, Response } from 'express';
import { supplierService } from '../services/supplier.service';

export const supplierController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      res.json({ success: true, data: suppliers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const supplier = await supplierService.getSupplierById(id);
      
      if (!supplier) {
        res.status(404).json({ success: false, message: 'Supplier tidak ditemukan' });
        return;
      }
      
      res.json({ success: true, data: supplier });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      
      if (!name || name.trim() === '') {
        res.status(400).json({ success: false, message: 'Nama supplier wajib diisi!' });
        return;
      }

      const newSupplier = await supplierService.createSupplier(req.body);
      res.status(201).json({ success: true, message: 'Supplier berhasil ditambahkan', data: newSupplier });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const updatedSupplier = await supplierService.updateSupplier(id, req.body);
      res.json({ success: true, message: 'Data supplier berhasil diubah', data: updatedSupplier });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      await supplierService.deleteSupplier(id);
      res.json({ success: true, message: 'Supplier berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};