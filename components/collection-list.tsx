"use client";

import { useState, useEffect } from "react";
import copyToClipboard from "copy-to-clipboard";
import { getUserCollections, deleteCollection } from "@/lib/auth";
import { CardCollection } from "@/lib/auth";
import { toast } from "react-toastify";
import {
  FiTrash2,
  FiPlay,
  FiPlus,
  FiLogOut,
  FiShare2,
  FiCheck,
} from "react-icons/fi";
import { ConfirmModal } from "@/components/confirm-modal";

interface CollectionListProps {
  username: string;
  onLogout: () => void;
  onCreateNew: () => void;
  onPlayCollection: (collection: CardCollection) => void;
}

export function CollectionList({
  username,
  onLogout,
  onCreateNew,
  onPlayCollection,
}: CollectionListProps) {
  const [collections, setCollections] = useState<CardCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    const result = await getUserCollections();
    setCollections(result);
    setLoading(false);
  };

  const handleDeleteClick = (collectionId: string) => {
    setDeleteCollectionId(collectionId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCollectionId) return;

    setDeleting(true);
    const result = await deleteCollection(deleteCollectionId);
    setDeleting(false);

    if (result.success) {
      setCollections(collections.filter((c) => c._id !== deleteCollectionId));
      toast.success("Collection deleted");
      setDeleteModalOpen(false);
      setDeleteCollectionId(null);
    } else {
      toast.error(result.error || "Failed to delete collection");
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setDeleteCollectionId(null);
  };

  const handleShare = async (collectionId: string) => {
    if (typeof window === "undefined") return;

    const shareUrl = `${window.location.origin}/play/${collectionId}`;

    const markShared = () => {
      setCopiedId(collectionId);
      toast.success("Share link copied!");
      setTimeout(() => setCopiedId(null), 2000);
    };

    try {
      const ua =
        typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          ua,
        );

      // On mobile, prefer native share sheet if available
      if (
        isMobile &&
        typeof navigator !== "undefined" &&
        (navigator as any).share
      ) {
        await (navigator as any).share({
          title: "Play this card collection",
          url: shareUrl,
        });
        markShared();
        return;
      }

      // On desktop (and as a general next step), prefer modern clipboard API
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(shareUrl);
        markShared();
        return;
      }

      // Fallback to JS clipboard helper (execCommand-based)
      const success = copyToClipboard(shareUrl);
      if (!success) {
        throw new Error("copy-to-clipboard failed");
      }

      markShared();
    } catch (error) {
      console.error("Share failed", error);
      // Last resort: show a prompt so user can manually copy
      window.prompt("Copy this link to share:", shareUrl);
    }
  };

  const handleDelete = (collectionId: string) => {
    handleDeleteClick(collectionId);
  };

  return (
    <div className="animate-fade-in w-full max-w-2xl px-4 sm:px-0">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Welcome, {username}!
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your Card Collections
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="bg-destructive/20 text-destructive hover:bg-destructive/30 flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all duration-200"
        >
          <FiLogOut className="h-4 w-4" />
          Logout
        </button>
      </header>

      {loading && (
        <div className="bg-card/90 rounded-xl border border-white/20 p-12 text-center shadow-xl backdrop-blur-sm">
          <p className="text-muted-foreground">Loading collections...</p>
        </div>
      )}

      {!loading && collections.length === 0 && (
        <div className="bg-card/90 animate-fade-in-up mb-6 rounded-xl border border-white/20 p-8 text-center shadow-xl backdrop-blur-sm sm:p-12">
          <div className="mb-4 text-5xl" aria-hidden>
            📭
          </div>
          <h2 className="text-foreground mb-2 text-xl font-semibold">
            No Collections Yet
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Create your first collection to start playing.
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FiPlus className="h-5 w-5" />
            Create Collection
          </button>
        </div>
      )}

      {!loading && collections.length > 0 && (
        <div className="mb-6 max-h-112 space-y-4 overflow-y-auto pr-1">
          {collections.map((collection, index) => (
            <div
              key={collection._id}
              className="bg-card/90 animate-fade-in-up rounded-xl border border-white/20 p-5 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl sm:p-6"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground mb-2 truncate text-lg font-semibold">
                    {collection.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {collection.cards.map((card, idx) => (
                      <span
                        key={idx}
                        className="bg-primary/20 text-primary inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium"
                      >
                        {card}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-3 text-xs">
                    Created:{" "}
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => onPlayCollection(collection)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium whitespace-nowrap transition-all duration-200"
                  >
                    <FiPlay className="h-4 w-4" />
                    Play
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(collection._id)}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                      copiedId === collection._id
                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                        : "text-foreground bg-white/10 hover:bg-white/20"
                    }`}
                    title="Share collection"
                  >
                    {copiedId === collection._id ? (
                      <FiCheck className="h-4 w-4" />
                    ) : (
                      <FiShare2 className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(collection._id)}
                    className="bg-destructive/20 hover:bg-destructive/30 text-destructive flex items-center justify-center rounded-lg px-3 py-2 transition-colors"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && collections.length > 0 && (
        <button
          type="button"
          onClick={onCreateNew}
          className="text-foreground flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/15 py-3 font-semibold transition-all duration-200 hover:bg-white/25"
        >
          <FiPlus className="h-5 w-5" />
          Create New Collection
        </button>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Collection?"
        message="This action cannot be undone. All data in this collection will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
