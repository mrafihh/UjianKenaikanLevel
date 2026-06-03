'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X, Package, Tag, Image as ImageIcon, Loader2, Filter, Upload } from 'lucide-react';

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  jumlahStock: number;
  emoji?: string;
};

export default function MenuManagement() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'AVAILABLE' | 'OUT_OF_STOCK'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 👇 STATE BARU: Tambahkan imageFile untuk menampung data file fisik
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: 'FOOD', 
    imageUrl: null as string | null, 
    jumlahStock: '',
    imageFile: null as File | null // Menyimpan file upload
  });

  // State untuk preview gambar saat dipilih
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const getAuthToken = () => {
    return localStorage.getItem('admin_token');
  };

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/menu?availableOnly=false`);
      if (!res.ok) throw new Error('Gagal mengambil data menu');
      const data = await res.json();
      setMenus(data);
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat memuat menu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = 
      stockFilter === 'ALL' ? true :
      stockFilter === 'AVAILABLE' ? menu.jumlahStock > 0 :
      menu.jumlahStock === 0;
      
    return matchesSearch && matchesStock;
  });

  const openAddModal = () => { 
    setEditingId(null); 
    setFormData({ name: '', description: '', price: '', category: 'FOOD', imageUrl: null, jumlahStock: '', imageFile: null }); 
    setImagePreview(null);
    setIsModalOpen(true); 
  };
  
  const openEditModal = (menu: MenuItem) => { 
    setEditingId(menu.id); 
    setFormData({ 
      name: menu.name, 
      description: menu.description || '', 
      price: menu.price.toString(), 
      category: menu.category || 'FOOD', 
      imageUrl: menu.imageUrl, 
      jumlahStock: menu.jumlahStock.toString(),
      imageFile: null
    }); 
    setImagePreview(menu.imageUrl); // Set preview ke gambar lama jika ada
    setIsModalOpen(true); 
  };

  // 👇 FUNGSI BARU: Menangani pemilihan gambar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      setImagePreview(URL.createObjectURL(file)); // Buat URL lokal untuk preview
    }
  };

  // 👇 UPDATE LOGIKA SUBMIT DENGAN DEBUGGING LENGKAP
  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('category', formData.category);
    submitData.append('jumlahStock', formData.jumlahStock);
    
    if (formData.imageFile) {
      submitData.append('image', formData.imageFile);
    }

    // 🕵️‍♂️ DEBUG 1: Cek isi FormData yang akan dikirim
    console.log("=== 🚀 DEBUG: DATA YANG DIKIRIM ===");
    for (let [key, value] of submitData.entries()) {
      console.log(`- ${key}:`, value);
    }

    try {
      const token = getAuthToken();
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const url = editingId ? `${API_URL}/menu/${editingId}` : `${API_URL}/menu`;
      const method = editingId ? 'PATCH' : 'POST';

      // 🕵️‍♂️ DEBUG 2: Cek Target URL
      console.log(`=== 🎯 DEBUG: MENGIRIM REQUEST KE [${method}] ${url} ===`);

      const res = await fetch(url, {
        method: method,
        headers: headers,
        body: submitData 
      });
      
      // 🕵️‍♂️ DEBUG 3: Cek Status HTTP
      console.log(`=== 🚦 DEBUG: STATUS RESPONSE: ${res.status} ${res.statusText} ===`);

      if (!res.ok) {
        // 🕵️‍♂️ DEBUG 4: Baca respon asli (mentah) dari backend sebelum di-parse ke JSON
        const rawText = await res.text();
        console.error("=== 💥 DEBUG: RAW RESPONSE DARI BACKEND ===", rawText);
        
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        try {
          // Coba ubah ke JSON (jika backend mengirim pesan error JSON resmi NestJS)
          const errData = JSON.parse(rawText);
          errorMessage = errData.message || JSON.stringify(errData);
        } catch (e) {
          // Jika gagal parse (berarti backend membuang error berupa teks biasa atau HTML)
          errorMessage = rawText;
        }

        throw new Error(`Detail Error: ${errorMessage}`);
      }
      
      console.log("=== ✅ DEBUG: SUKSES MENYIMPAN! ===");
      await fetchMenus();
      setIsModalOpen(false);
    } catch (error) {
      console.error("=== 🚨 DEBUG: TERTANGKAP DI CATCH ===", error);
      // Memunculkan pop-up alert yang menampilkan pesan error aslinya!
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan sistem yang tidak diketahui.');
    } finally {
      setIsSubmitting(false);
    }
  };

// 👇 FUNGSI DELETE DENGAN DETEKTIF DEBUGGING
  const handleDelete = async (id: number) => { 
    if (!window.confirm('Hapus menu ini secara permanen?')) return;

    try {
      const token = getAuthToken(); 
      console.log(`=== 🎯 DEBUG: MENGIRIM REQUEST KE [DELETE] ${API_URL}/menu/${id} ===`);

      const res = await fetch(`${API_URL}/menu/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`=== 🚦 DEBUG: STATUS RESPONSE DELETE: ${res.status} ===`);

      if (!res.ok) {
        // 🕵️‍♂️ Tangkap error asli dari backend
        const rawText = await res.text();
        console.error("=== 💥 DEBUG: RAW RESPONSE DELETE ===", rawText);
        
        let errorMessage = 'Gagal menghapus menu';
        try {
          const errData = JSON.parse(rawText);
          // NestJS biasanya menyimpan pesan di dalam errData.message
          errorMessage = typeof errData.message === 'string' ? errData.message : JSON.stringify(errData.message);
        } catch(e) {
          errorMessage = rawText;
        }
        
        throw new Error(errorMessage);
      }
      
      console.log("=== ✅ DEBUG: SUKSES MENGHAPUS! ===");
      setMenus(menus.filter(m => m.id !== id));
    } catch (error) {
      console.error("=== 🚨 DEBUG: TERTANGKAP DI CATCH ===", error);
      alert(`Gagal Menghapus: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 mb-2">Manajemen Menu</h1>
          <p className="text-stone-500 font-medium">Kelola daftar hidangan dan stok.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Cari menu..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:border-brand outline-none w-full sm:w-56" 
            />
          </div>

          <div className="relative">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="pl-9 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:border-brand outline-none appearance-none cursor-pointer text-stone-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="AVAILABLE">Tersedia</option>
              <option value="OUT_OF_STOCK">Habis</option>
            </select>
          </div>

          <button onClick={openAddModal} className="bg-stone-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap">
            <Plus size={16}/> Tambah
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-brand" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map((menu) => (
            <div key={menu.id} className={`bg-white rounded-[20px] border border-stone-200/60 shadow-sm group flex flex-col overflow-hidden relative ${menu.jumlahStock === 0 ? 'opacity-70 grayscale-[20%]' : ''}`}>
              
              {menu.jumlahStock === 0 && (
                <div className="absolute top-3 left-3 z-10 bg-stone-900/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                  Stok Habis
                </div>
              )}

              <div className="relative h-44 w-full bg-stone-100 flex items-center justify-center overflow-hidden">
                {menu.imageUrl ? (
                  <img src={menu.imageUrl.startsWith('http') ? menu.imageUrl : `${API_URL}${menu.imageUrl}`} alt={menu.name} className="w-full h-full object-cover" /> 
                ) : (
                  <ImageIcon size={32} className="text-stone-300" />
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-3 gap-2">
                  <button onClick={() => openEditModal(menu)} className="p-2 bg-white text-stone-700 hover:text-brand rounded-xl shadow-md transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(menu.id)} className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-xl shadow-md transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-stone-900 text-lg mb-1">{menu.name}</h3>
                <p className="text-stone-500 text-sm line-clamp-2 mb-4">{menu.description}</p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-100">
                  <div className="font-display font-bold text-brand">Rp {menu.price.toLocaleString('id-ID')}</div>
                  <div className="flex flex-col items-end gap-1 text-[11px] font-bold text-stone-500 uppercase">
                    <span className="flex items-center gap-1"><Tag size={12}/> {menu.category}</span>
                    <span className={`flex items-center gap-1 ${menu.jumlahStock === 0 ? 'text-red-500' : ''}`}>
                      <Package size={12}/> Stok: {menu.jumlahStock}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM TENTANG MENU */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setIsModalOpen(false)} className="absolute inset-0 bg-stone-900/50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[28px] p-6 w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto">
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900"><X size={20}/></button>
              <h2 className="font-display text-xl font-bold mb-6">{editingId ? 'Edit Menu' : 'Tambah Menu'}</h2>
              
              <form onSubmit={handleMenuSubmit} className="space-y-4">
                
                {/* 👇 INPUT FOTO MENU BARU */}
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors relative overflow-hidden group cursor-pointer">
                  {imagePreview ? (
                    <div className="w-full h-40 relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                        <span className="text-white font-medium text-sm flex items-center gap-2"><Upload size={16} /> Ganti Foto</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center text-stone-400">
                      <ImageIcon size={32} className="mb-2 opacity-50" />
                      <span className="text-sm font-medium">Klik untuk upload foto menu</span>
                      <span className="text-[10px] uppercase tracking-wider mt-1">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                  {/* Input file ditimpa penuh di atas area dengan opacity 0 agar bisa diklik */}
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    onChange={handleImageChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                </div>

                <input type="text" required placeholder="Nama Menu" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand" />
                <textarea rows={2} placeholder="Deskripsi" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand" />
                <div className="grid grid-cols-3 gap-4">
                  <input type="number" required placeholder="Harga" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand" />
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand">
                    <option value="FOOD">Food</option>
                    <option value="DRINK">Drink</option>
                    <option value="SNACK">Snack</option>
                  </select>
                  <input type="number" required placeholder="Stok" value={formData.jumlahStock} onChange={e => setFormData({...formData, jumlahStock: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand" />
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-brand text-white font-bold py-3.5 rounded-xl mt-4 disabled:bg-stone-300 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  {isSubmitting ? 'Mengunggah & Menyimpan...' : 'Simpan Menu'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}