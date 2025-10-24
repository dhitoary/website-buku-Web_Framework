import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Pastikan Link di-import
import api from '../api';
import { FaSpinner, FaTrash, FaUserEdit, FaHistory } from 'react-icons/fa'; // Pastikan FaHistory di-import

const ProfilePage = () => {
  const { user, setUser } = useAuth(); 
  const navigate = useNavigate();

  // State untuk alamat
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [error, setError] = useState(null);

  // State untuk formulir alamat baru (Pastikan inisialisasi lengkap)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Rumah',
    recipient_name: '',
    phone_number: '',
    address_line1: '',
    city: '',
    province: '',
    postal_code: '',
  });

  // State untuk edit nama
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  // useEffect pengaman login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Set nama awal saat user dimuat
      setNewName(user.name); 
    }
  }, [user, navigate]);

  // Fungsi ambil alamat
  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data.data);
    } catch (err) {
      setError('Gagal memuat alamat.');
      console.error(err);
    }
    setLoadingAddresses(false);
  };

  // useEffect ambil alamat
  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]); 

  // Handler input form alamat
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  // Handler submit alamat baru
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.post('/addresses', newAddress);
      setAddresses(prev => [...prev, response.data.data]);
      // Reset form
      setNewAddress({
        label: 'Rumah', recipient_name: '', phone_number: '',
        address_line1: '', city: '', province: '', postal_code: '',
      });
    } catch (err) {
      setError('Gagal menyimpan alamat. Pastikan semua field terisi.');
      console.error(err);
    }
    setIsSubmitting(false);
  };

  // Handler hapus alamat
  const handleAddressDelete = async (addressId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      return;
    }
    try {
      await api.delete(`/addresses/${addressId}`);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    } catch (err) {
      setError('Gagal menghapus alamat.');
      console.error(err);
    }
  };

  // Handler update nama (placeholder)
  const handleNameUpdate = async () => {
    alert('Fitur update nama akan segera hadir!');
    setIsEditingName(false);
    // TODO: Implement API call to update user name
    // try {
    //   const response = await api.put('/user', { name: newName });
    //   setUser(response.data); // Update user in AuthContext
    //   setIsEditingName(false);
    // } catch (err) {
    //   console.error("Gagal update nama", err);
    //   // Handle error display
    // }
  };

  // Jangan render jika user belum ada (saat loading awal AuthContext)
  if (!user) return null; 

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Kolom Kiri: Info Akun & Alamat Baru */}
      <div className="w-full lg:w-1/3">
        {/* Info Akun */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Profil Saya</h2>
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-4xl">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
          
          {isEditingName ? (
            <div className="space-y-2">
              <input 
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleNameUpdate}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm"
                >
                  Simpan
                </button>
                <button 
                  onClick={() => { setIsEditingName(false); setNewName(user.name); }} // Reset nama jika batal
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="text-gray-400 hover:text-blue-600"
                  title="Edit Nama"
                >
                  <FaUserEdit />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4">{user.email}</p> 
              <Link 
                to="/profile/orders" 
                className="flex items-center justify-center gap-2 text-blue-600 hover:underline text-sm font-medium"
              >
                <FaHistory />
                Lihat Riwayat Pesanan
              </Link>
            </div>
          )}
        </div>

        {/* Form Tambah Alamat Baru */}
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
          <h2 className="text-xl font-bold mb-4">Tambah Alamat Baru</h2>
          <form onSubmit={handleAddressSubmit} className="space-y-3">
             {/* Form Input Fields */}
             <input name="label" value={newAddress.label} onChange={handleAddressChange} placeholder="Label (cth: Rumah)" className="w-full border px-3 py-2 rounded-md text-sm" />
             <input name="recipient_name" value={newAddress.recipient_name} onChange={handleAddressChange} placeholder="Nama Penerima" required className="w-full border px-3 py-2 rounded-md text-sm" />
             <input name="phone_number" value={newAddress.phone_number} onChange={handleAddressChange} placeholder="Nomor HP" required className="w-full border px-3 py-2 rounded-md text-sm" />
             <textarea name="address_line1" value={newAddress.address_line1} onChange={handleAddressChange} placeholder="Alamat Lengkap" required className="w-full border px-3 py-2 rounded-md text-sm" rows="3"></textarea>
             <input name="city" value={newAddress.city} onChange={handleAddressChange} placeholder="Kota" required className="w-full border px-3 py-2 rounded-md text-sm" />
             <input name="province" value={newAddress.province} onChange={handleAddressChange} placeholder="Provinsi" required className="w-full border px-3 py-2 rounded-md text-sm" />
             <input name="postal_code" value={newAddress.postal_code} onChange={handleAddressChange} placeholder="Kode Pos" required className="w-full border px-3 py-2 rounded-md text-sm" />
             <button 
               type="submit"
               disabled={isSubmitting}
               className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400"
             >
               {isSubmitting ? <FaSpinner className="animate-spin inline mr-2"/> : null}
               {isSubmitting ? 'Menyimpan...' : 'Simpan Alamat'}
             </button>
             {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </form>
        </div>
      </div>

      {/* Kolom Kanan: Daftar Alamat */}
      <div className="w-full lg:w-2/3">
        <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]"> {/* Tambah min-h agar tidak collapse */}
          <h2 className="text-xl font-bold mb-4">Daftar Alamat Saya</h2>
          {loadingAddresses ? (
            <div className="flex justify-center items-center h-48">
              <FaSpinner className="animate-spin text-blue-600" size={30} />
            </div>
          ) : addresses.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Anda belum memiliki alamat tersimpan.</p>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="border rounded-lg p-4 relative hover:shadow-sm transition-shadow">
                   <div className="pr-16"> {/* Beri ruang untuk tombol */}
                      <span className="font-semibold text-lg">{addr.label}</span>
                      <p className="font-medium text-sm">{addr.recipient_name} ({addr.phone_number})</p>
                      <p className="text-gray-600 text-sm">{addr.address_line1}</p>
                      <p className="text-gray-600 text-sm">{addr.city}, {addr.province} {addr.postal_code}</p>
                   </div>
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    {/* Tombol Edit (belum difungsikan) */}
                    <button 
                      onClick={() => alert('Fitur edit alamat akan segera hadir!')} // Placeholder
                      className="text-gray-400 hover:text-blue-600 p-1" 
                      title="Edit"
                    >
                      <FaUserEdit />
                    </button>
                    <button 
                      onClick={() => handleAddressDelete(addr.id)}
                      className="text-gray-400 hover:text-red-600 p-1" 
                      title="Hapus"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ProfilePage;