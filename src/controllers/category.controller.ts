import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';

export const categoryController = {
    getAll: async (req: Request, res: Response): Promise<void> => {
        try {
            const categories = await categoryService.getAllCategories();
            res.json({ success: true, data: categories });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id as string);
            const category = await categoryService.getCategoryById(id);

            if (!category) {
                res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
                return;
            }

            res.json({ success: true, data: category });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, color, icon } = req.body;

            // Validasi input
            if (!name || !color || !icon) {
                res.status(400).json({ success: false, message: 'Nama, warna, dan icon wajib diisi!' });
                return;
            }

            const newCategory = await categoryService.createCategory(req.body);
            res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan', data: newCategory });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id as string);
            const updatedCategory = await categoryService.updateCategory(id, req.body);
            res.json({ success: true, message: 'Kategori berhasil diubah', data: updatedCategory });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id as string);
            await categoryService.deleteCategory(id);
            res.json({ success: true, message: 'Kategori berhasil dihapus' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};