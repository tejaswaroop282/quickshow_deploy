import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/dateFormat';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ListShows = () => {

    const currency = import.meta.env.VITE_CURRENCY

    const {axios, getToken, user} = useAppContext()

    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingShowId, setEditingShowId] = useState(null);
    const [editShowDateTime, setEditShowDateTime] = useState("");
    const [editShowPrice, setEditShowPrice] = useState(0);

    const getAllShows = async () =>{
        try {
            const { data } = await axios.get("/api/admin/all-shows", {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            setShows(data.shows)
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load shows");
        }
    }

    const startEditing = (show) => {
        setEditingShowId(show._id);
        // Format ISO String to YYYY-MM-DDThh:mm for datetime-local input
        const date = new Date(show.showDateTime);
        const tzOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
        setEditShowDateTime(localISOTime);
        setEditShowPrice(show.showPrice);
    }

    const cancelEditing = () => {
        setEditingShowId(null);
        setEditShowDateTime("");
        setEditShowPrice(0);
    }

    const handleUpdate = async (id) => {
        try {
            const { data } = await axios.put(`/api/show/update/${id}`, {
                showDateTime: editShowDateTime,
                showPrice: editShowPrice
            }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if (data.success) {
                toast.success(data.message || "Show updated successfully!");
                setEditingShowId(null);
                getAllShows();
            } else {
                toast.error(data.message || "Update failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error updating show");
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this show?")) {
            return;
        }

        try {
            const { data } = await axios.delete(`/api/show/delete/${id}`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if (data.success) {
                toast.success(data.message || "Show deleted successfully!");
                getAllShows();
            } else {
                toast.error(data.message || "Delete failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error deleting show");
        }
    }

    useEffect(() => {
        if(user){
            getAllShows();
        }   
    }, [user]);

  return !loading ? (
    <>
      <Title text1="List" text2="Shows" />
      <div className="max-w-5xl mt-6 overflow-x-auto">
         <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
              <thead>
                 <tr className="bg-primary/20 text-left text-white">
                     <th className="p-2 font-medium pl-5">Movie Name</th>
                     <th className="p-2 font-medium">Show Time</th>
                     <th className="p-2 font-medium">Total Bookings</th>
                     <th className="p-2 font-medium">Price</th>
                     <th className="p-2 font-medium text-center">Actions</th>
                 </tr>
             </thead>
             <tbody className="text-sm font-light">
                 {shows.map((show, index) => {
                     const isEditing = editingShowId === show._id;
                     return (
                         <tr key={index} className="border-b border-primary/10 bg-primary/5 even:bg-primary/10">
                             <td className="p-2 min-w-45 pl-5">{show.movie?.title || "Deleted Movie"}</td>
                             <td className="p-2">
                                 {isEditing ? (
                                     <input 
                                         type="datetime-local" 
                                         className="bg-black/40 border border-primary/30 rounded px-2 py-1 text-white focus:outline-none focus:border-primary"
                                         value={editShowDateTime}
                                         onChange={(e) => setEditShowDateTime(e.target.value)}
                                     />
                                 ) : (
                                     dateFormat(show.showDateTime)
                                 )}
                             </td>
                             <td className="p-2">{Object.keys(show.occupiedSeats || {}).length}</td>
                             <td className="p-2">
                                 {isEditing ? (
                                     <div className="flex items-center gap-1">
                                         <span>{currency}</span>
                                         <input 
                                             type="number" 
                                             className="bg-black/40 border border-primary/30 rounded px-2 py-1 text-white w-20 focus:outline-none focus:border-primary"
                                             value={editShowPrice}
                                             onChange={(e) => setEditShowPrice(Number(e.target.value))}
                                         />
                                     </div>
                                 ) : (
                                     `${currency} ${show.showPrice}`
                                 )}
                             </td>
                             <td className="p-2 text-center">
                                 {isEditing ? (
                                     <div className="flex justify-center gap-2">
                                         <button 
                                             onClick={() => handleUpdate(show._id)}
                                             className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded transition duration-200 cursor-pointer"
                                         >
                                             Save
                                         </button>
                                         <button 
                                             onClick={cancelEditing}
                                             className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded transition duration-200 cursor-pointer"
                                         >
                                             Cancel
                                         </button>
                                     </div>
                                 ) : (
                                     <div className="flex justify-center gap-2">
                                         <button 
                                             onClick={() => startEditing(show)}
                                             className="bg-primary/80 hover:bg-primary text-white text-xs font-semibold px-3 py-1 rounded transition duration-200 cursor-pointer"
                                         >
                                             Edit
                                         </button>
                                         <button 
                                             onClick={() => handleDelete(show._id)}
                                             className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded transition duration-200 cursor-pointer"
                                         >
                                             Delete
                                         </button>
                                     </div>
                                 )}
                             </td>
                         </tr>
                     );
                 })}
             </tbody>
         </table>
      </div>
    </>
  ) : <Loading />
}

export default ListShows
