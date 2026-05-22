import { Request, Response } from 'express';
import { unitService } from '../services/unit.service';

export const unitController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const units = await unitService.getAllUnits();
      res.json({ success: true, data: units });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const unit = await unitService.getUnitById(id);

      if (!unit) {
        res.status(404).json({ success: false, message: 'Unit tidak ditemukan' });
        return;
      }

      res.json({ success: true, data: unit });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, isDefault } = req.body;

      if (!name) {
        res.status(400).json({ success: false, message: 'Nama unit wajib diisi!' });
        return;
      }

      const newUnit = await unitService.createUnit({ name, isDefault });
      res.status(201).json({ success: true, message: 'Unit berhasil ditambahkan', data: newUnit });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ success: false, message: 'Nama unit sudah digunakan' });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const updatedUnit = await unitService.updateUnit(id, req.body);
      res.json({ success: true, message: 'Unit berhasil diubah', data: updatedUnit });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ success: false, message: 'Nama unit sudah digunakan' });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      await unitService.deleteUnit(id);
      res.json({ success: true, message: 'Unit berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};