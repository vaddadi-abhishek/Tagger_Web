import { useState } from "react";
import type { CollectionItem } from "../types/collection";
import { INITIAL_COLLECTIONS } from "../dummy_data/collectionsData";
import { CollectionCard } from "../components/CollectionCard";
import { CreateItemModal } from "../components/CreateItemModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

interface CollectionsScreenProps {
  collections?: CollectionItem[];
  onCollectionsChange?: (updated: CollectionItem[]) => void;
}

export default function CollectionsScreen({
  collections: externalCollections,
  onCollectionsChange,
}: CollectionsScreenProps) {
  const [internalCollections, setInternalCollections] =
    useState<CollectionItem[]>(INITIAL_COLLECTIONS);

  const collections = externalCollections || internalCollections;

  const updateCollections = (updated: CollectionItem[]) => {
    if (onCollectionsChange) {
      onCollectionsChange(updated);
    } else {
      setInternalCollections(updated);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const cleanSearch = searchTerm.toLowerCase().trim();

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(cleanSearch)
  );

  const handleCreate = (name: string, color: string) => {
    const newItem: CollectionItem = {
      id: `c_${Date.now()}`,
      name,
      count: 0,
      color,
    };
    updateCollections([...collections, newItem]);
  };

  const handleRename = (id: string, newName: string) => {
    updateCollections(
      collections.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const handleColorChange = (id: string, newColor: string) => {
    updateCollections(
      collections.map((c) => (c.id === id ? { ...c, color: newColor } : c))
    );
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      updateCollections(collections.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-h)]">Collections</h1>
          <p className="text-sm text-[var(--text)]">
            Group related bookmarks into folders you can navigate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--text)] pointer-events-none opacity-70"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-base sm:text-sm rounded-xl bg-[var(--code-bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors leading-normal"
            />
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 shadow-md transition-opacity cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <span>New collection</span>
          </button>
        </div>
      </div>

      {/* Grid of Collection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCollections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onRename={handleRename}
            onDelete={(id) => setDeleteId(id)}
            onColorChange={handleColorChange}
          />
        ))}

        {filteredCollections.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--text)] border border-dashed border-[var(--border)] rounded-2xl">
            No collections found matching your search.
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      <CreateItemModal
        isOpen={isCreateOpen}
        title="Create New Collection"
        placeholder="Collection name (e.g. Reading List)"
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
