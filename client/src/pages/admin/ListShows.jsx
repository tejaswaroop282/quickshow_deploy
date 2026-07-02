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
    
    // Modal states
    const [selectedShow, setSelectedShow] = useState(null);
    const [editShowDateTime, setEditShowDateTime] = useState("");
    const [editShowPrice, setEditShowPrice] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const getAllShows = async () => {
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

    const openManageModal = (show) => {
        setSelectedShow(show);
        // Format ISO String to YYYY-MM-DDThh:mm for datetime-local input
        const date = new Date(show.showDateTime);
        const tzOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
        setEditShowDateTime(localISOTime);
        setEditShowPrice(show.showPrice);
    }

    const closeManageModal = () => {
        setSelectedShow(null);
        setEditShowDateTime("");
        setEditShowPrice(0);
    }

    const handleUpdate = async () => {
        if (!selectedShow) return;
        setIsSaving(true);
        try {
            const { data } = await axios.put(`/api/show/update/${selectedShow._id}`, {
                showDateTime: editShowDateTime,
                showPrice: editShowPrice
            }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if (data.success) {
                toast.success(data.message || "Show updated successfully!");
                closeManageModal();
                getAllShows();
            } else {
                toast.error(data.message || "Update failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error updating show");
        } finally {
            setIsSaving(false);
        }
    }

    const handleDelete = async () => {
        if (!selectedShow) return;
        if (!window.confirm(`Are you sure you want to delete this show for "${selectedShow.movie?.title}" completely?`)) {
            return;
        }

        try {
            const { data } = await axios.delete(`/api/show/delete/${selectedShow._id}`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if (data.success) {
                toast.success(data.message || "Show deleted successfully!");
                closeManageModal();
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
                     return (
                         <tr 
                             key={index} 
                             onClick={() => openManageModal(show)}
                             className="border-b border-primary/10 bg-primary/5 even:bg-primary/10 hover:bg-primary/20 transition-colors duration-150 cursor-pointer"
                         >
                             <td className="p-3 min-w-45 pl-5 font-medium">{show.movie?.title || "Deleted Movie"}</td>
                             <td className="p-3">{dateFormat(show.showDateTime)}</td>
                             <td className="p-3">{Object.keys(show.occupiedSeats || {}).length}</td>
                             <td className="p-3">{currency} {show.showPrice}</td>
                             <td className="p-3 text-center">
                                 <button 
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         openManageModal(show);
                                     }}
                                     className="bg-primary/80 hover:bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded transition duration-200 cursor-pointer"
                                 >
                                     Manage
                                 </button>
                             </td>
                         </tr>
                     );
                 })}
             </tbody>
         </table>
      </div>

      {/* Modern Manage Show Modal */}
      {selectedShow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div 
                  className="bg-zinc-900 border border-primary/30 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
              >
                  {/* Modal Header */}
                  <div className="px-6 py-4 bg-primary/15 border-b border-primary/20 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white truncate">Manage Show</h2>
                      <button 
                          onClick={closeManageModal}
                          className="text-gray-400 hover:text-white transition duration-150 cursor-pointer text-xl"
                      >
                          &times;
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Movie</label>
                          <p className="text-white font-medium">{selectedShow.movie?.title || "Deleted Movie"}</p>
                      </div>

                      <div>
                          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Show Time</label>
                          <input 
                              type="datetime-local" 
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary transition"
                              value={editShowDateTime}
                              onChange={(e) => setEditShowDateTime(e.target.value)}
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Ticket Price ({currency})</label>
                          <input 
                              type="number" 
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary transition"
                              value={editShowPrice}
                              onChange={(e) => setEditShowPrice(Number(e.target.value))}
                          />
                      </div>

                      <div className="pt-2 text-xs text-gray-400">
                          <span className="font-semibold text-primary">Booked Seats: </span> 
                          {Object.keys(selectedShow.occupiedSeats || {}).length > 0 
                              ? Object.keys(selectedShow.occupiedSeats).join(", ") 
                              : "None"}
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 flex flex-wrap justify-between items-center gap-3">
                      <button 
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition duration-200 cursor-pointer"
                      >
                          Delete Show
                      </button>
                      <div className="flex gap-2">
                          <button 
                              onClick={closeManageModal}
                              className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition duration-200 cursor-pointer"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleUpdate}
                              disabled={isSaving}
                              className="bg-primary hover:bg-primary-dull disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-md transition duration-200 cursor-pointer"
                          >
                              {isSaving ? "Saving..." : "Save Changes"}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </>
  ) : <Loading />
}

export default ListShows
