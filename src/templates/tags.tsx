import { useState } from "react";
import type { TagItem } from "../types/tag";
import { INITIAL_TAGS } from "../dummy_data/tagsData";
import { TagRow } from "../components/TagRow";
import { CreateItemModal } from "../components/CreateItemModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

interface TagsScreenProps {
  tags?: TagItem[];
  onTagsChange?: (updated: TagItem[]) => void;
}

export default function TagsScreen({
  tags: externalTags,
  onTagsChange,
}: TagsScreenProps) {
  const [internalTags, setInternalTags] = useState<TagItem[]>(INITIAL_TAGS);

  const tags = externalTags || internalTags;

  const updateTags = (updated: TagItem[]) => {
    if (onTagsChange) {
      onTagsChange(updated);
    } else {
      setInternalTags(updated);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const cleanSearch = searchTerm.toLowerCase().trim().replace(/^#/, "");

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().replace(/^#/, "").includes(cleanSearch)
  );

  const handleCreate = (name: string, color: string) => {
    const cleanName = name.replace(/^#/, "");
    const newItem: TagItem = {
      id: `t_${Date.now()}`,
      name: cleanName,
      count: 0,
      color,
    };
    updateTags([...tags, newItem]);
  };

  const handleRename = (id: string, newName: string) => {
    const cleanName = newName.replace(/^#/, "");
    updateTags(tags.map((t) => (t.id === id ? { ...t, name: cleanName } : t)));
  };

  const handleColorChange = (id: string, newColor: string) => {
    updateTags(tags.map((t) => (t.id === id ? { ...t, color: newColor } : t)));
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      updateTags(tags.filter((t) => t.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-h)]">Tags</h1>
          <p className="text-sm text-[var(--text)]">
            Cross-cut your bookmarks with lightweight, colorful labels.
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
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[var(--code-bg)] border border-[var(--border)] text-[var(--text-h)] placeholder-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors truncate placeholder:truncate leading-normal"
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
            <span>New tag</span>
          </button>
        </div>
      </div>

      {/* Stacked List of Tag Rows */}
      <div className="bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[var(--shadow)] divide-y divide-[var(--border)]">
        {filteredTags.map((tag) => (
          <TagRow
            key={tag.id}
            tag={tag}
            onRename={handleRename}
            onDelete={(id) => setDeleteId(id)}
            onColorChange={handleColorChange}
          />
        ))}

        {filteredTags.length === 0 && (
          <div className="text-center py-12 text-[var(--text)] italic">
            No tags found matching your search.
          </div>
        )}
      </div>

      {/* Create Tag Modal */}
      <CreateItemModal
        isOpen={isCreateOpen}
        title="Create New Tag"
        placeholder="Tag name (e.g. productivity)"
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
