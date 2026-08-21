"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { bottomPageSectionLabels, bottomPageSections, type BottomPageSection } from "@/lib/bottom-page-config";

type BottomPage = {
  id: string;
  section: BottomPageSection;
  label: string;
  slug: string;
  title: string;
  content: string;
};

type PageForm = Omit<BottomPage, "id">;

const emptyForm: PageForm = { section: "sale", label: "", slug: "", title: "", content: "" };

const BottomPagesManager = () => {
  const [pages, setPages] = useState<BottomPage[]>([]);
  const [form, setForm] = useState<PageForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPages = async () => {
    const response = await fetch("/api/bottom-pages", { cache: "no-store" });
    if (response.ok) setPages(await response.json());
  };

  useEffect(() => {
    loadPages();
  }, []);

  const updateField = (field: keyof PageForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const startEdit = (page: BottomPage) => {
    setEditingId(page.id);
    setForm({ section: page.section, label: page.label, slug: page.slug, title: page.title, content: page.content });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const savePage = async () => {
    setLoading(true);
    const response = await fetch(editingId ? `/api/bottom-pages/${editingId}` : "/api/bottom-pages", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) {
      toast.error(result.error || "Page could not be saved");
      return;
    }
    toast.success(editingId ? "Page updated" : "Page added");
    resetForm();
    await loadPages();
  };

  const deletePage = async (page: BottomPage) => {
    if (!window.confirm(`Delete ${page.label}?`)) return;
    const response = await fetch(`/api/bottom-pages/${page.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Page could not be deleted");
      return;
    }
    toast.success("Page deleted");
    if (editingId === page.id) resetForm();
    await loadPages();
  };

  return (
    <section className="flex max-w-4xl flex-col gap-y-5 border border-gray-200 p-6">
      <div>
        <h2 className="text-xl font-semibold">Bottom Pages</h2>
        <p className="mt-1 text-gray-600">Add, modify, or delete the pages linked from the bottom of the website.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <select className="select select-bordered" value={form.section} onChange={(event) => updateField("section", event.target.value)}>
          {bottomPageSections.map((section) => <option value={section} key={section}>{bottomPageSectionLabels[section]}</option>)}
        </select>
        <input className="input input-bordered" placeholder="Footer label" value={form.label} onChange={(event) => updateField("label", event.target.value)} />
        <input className="input input-bordered" placeholder="URL slug, e.g. faq" value={form.slug} onChange={(event) => updateField("slug", event.target.value)} />
        <input className="input input-bordered" placeholder="Page title" value={form.title} onChange={(event) => updateField("title", event.target.value)} />
      </div>
      <textarea className="textarea textarea-bordered min-h-40 w-full" placeholder="Page content" value={form.content} onChange={(event) => updateField("content", event.target.value)} />
      <div className="flex gap-2">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={savePage}>{editingId ? "Save changes" : "Add page"}</button>
        {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
      </div>
      <div className="divide-y divide-gray-200 border-t border-gray-200">
        {pages.map((page) => (
          <div className="flex flex-wrap items-center gap-3 py-3" key={page.id}>
            <div className="mr-auto">
              <p className="font-semibold">{page.label}</p>
              <p className="text-sm text-gray-500">{bottomPageSectionLabels[page.section]} / {page.slug}</p>
            </div>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => startEdit(page)}>Modify</button>
            <button type="button" className="btn btn-sm btn-error" onClick={() => deletePage(page)}>Delete</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BottomPagesManager;
