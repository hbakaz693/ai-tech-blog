"use client";

import React, { useState, useEffect } from "react";
import { X, Star, User, ThumbsUp } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { Review } from "../types";

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateTitle: string;
}

export default function ReviewsModal({ isOpen, onClose, templateId, templateTitle }: ReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ user_name: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    if (isOpen) fetchReviews();
  }, [isOpen]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });
    
    if (!error) setReviews(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { error } = await supabase
      .from('reviews')
      .insert([{
        template_id: templateId,
        user_name: newReview.user_name,
        rating: newReview.rating,
        comment: newReview.comment
      }]);
    
    if (!error) {
      setNewReview({ user_name: "", rating: 5, comment: "" });
      fetchReviews();
    }
    setSubmitting(false);
  };

  const handleLike = async (reviewId: string) => {
    await supabase.rpc('increment_likes', { review_id: reviewId });
    fetchReviews();
  };

  if (!isOpen) return null;

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold">Avis clients</h2>
            <p className="text-sm text-gray-500">{templateTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <>
              {/* Résumé */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                    <div className="flex mt-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={16} className={s <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">{reviews.length} avis</div>
                  </div>
                </div>
              </div>

              {/* Formulaire d'avis */}
              <form onSubmit={handleSubmit} className="mb-6 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Donnez votre avis</h4>
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={newReview.user_name}
                  onChange={(e) => setNewReview({...newReview, user_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded mb-2"
                  required
                />
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded mb-2"
                >
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} étoiles</option>)}
                </select>
                <textarea
                  placeholder="Votre commentaire"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  className="w-full px-3 py-2 border rounded mb-2"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Envoi..." : "Envoyer l'avis"}
                </button>
              </form>

              {/* Liste des avis */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <img src={review.user_avatar || `https://ui-avatars.com/api/?name=${review.user_name}`} alt="" className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{review.user_name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={14} className={s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                                ))}
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(review.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                          <button onClick={() => handleLike(review.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600">
                            <ThumbsUp size={14} />
                            {review.likes || 0}
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}