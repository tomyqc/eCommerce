"use client";

import { DashboardSidebar } from "@/components";
import { useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api";
import { convertCategoryNameToURLFriendly } from "../../../../utils/categoryFormating";
import BottomPagesManager from "@/components/BottomPagesManager";
import { FaShapes } from "react-icons/fa6";
import Link from "next/link";

type AnnouncementEditorItem = { id: string; title: string | null; media: string; mediaType: "image" | "video" };

function AnnouncementEditor({ item, editing, onEdit, onCancel, onSave, onDelete }: { item: AnnouncementEditorItem; editing: boolean; onEdit: () => void; onCancel: () => void; onSave: (id: string, title: string, file?: File) => void; onDelete: (id: string) => void }) {
  const [title, setTitle] = useState(item.title || "");
  const [file, setFile] = useState<File>();
  return <div className="border border-gray-200 p-4">
    {item.mediaType === "video" ? <video src={item.media} controls className="h-40 w-full object-contain" /> : <img src={item.media} alt={item.title || "Announcement"} className="h-40 w-full object-contain" />}
    {editing ? <div className="mt-3 flex flex-col gap-2">
      <input className="input input-bordered input-sm w-full" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional title" />
      <input className="file-input file-input-bordered file-input-sm w-full" type="file" accept="image/*,video/*" onChange={(event) => setFile(event.target.files?.[0])} />
      <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-primary" onClick={() => onSave(item.id, title, file)}>Save changes</button><button type="button" className="btn btn-sm btn-outline" onClick={onCancel}>Cancel</button></div>
    </div> : <>
      <p className="mt-2 font-semibold">{item.title || "Untitled announcement"}</p>
      <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-outline mt-3" onClick={onEdit}>Modify</button><button type="button" className="btn btn-sm btn-error mt-3" onClick={() => onDelete(item.id)}>Delete</button></div>
    </>}
  </div>;
}

const SettingsPage = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [paymentLogosOpen, setPaymentLogosOpen] = useState(false);
  const [pubsOpen, setPubsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [logos, setLogos] = useState<{ slot: string; name: string }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcons, setCategoryIcons] = useState<Record<string, boolean>>({});
  const [pubs, setPubs] = useState<{ slot: string; name: string; image: string }[]>([]);
  const [pubUploading, setPubUploading] = useState<string | null>(null);
  const [paymentAccountsOpen, setPaymentAccountsOpen] = useState(false);
  const [shippingPriceOpen, setShippingPriceOpen] = useState(false);
  const [paymentAccounts, setPaymentAccounts] = useState({ ccpAccount: "", bankAccount: "", shippingCost: 5 });
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string | null; media: string; mediaType: "image" | "video" }[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementUploading, setAnnouncementUploading] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null);
  const [branding, setBranding] = useState({ logoPath: "/Logo.png", backgroundPath: "/ChatGPT Image Aug 20, 2026, 01_07_50 PM.png", backgroundOpacity: 0.2 });

  const loadPubs = async () => {
    const response = await fetch("/api/pubs", { cache: "no-store" });
    if (response.ok) setPubs(await response.json());
  };

  const uploadPub = async (slot: string | undefined, file: File | undefined) => {
    if (!file) return;
    setPubUploading(slot || "new");
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(slot ? `/api/pubs?slot=${slot}` : "/api/pubs", { method: "POST", body: formData });
    setPubUploading(null);
    if (response.ok) { toast.success(slot ? `${slot} photo updated` : "Photo added"); await loadPubs(); }
    else toast.error((await response.json()).error || "Photo upload failed");
  };

  const deletePub = async (slot: string) => {
    if (!window.confirm(`Restore the default ${slot} photo?`)) return;
    const response = await fetch(`/api/pubs?slot=${slot}`, { method: "DELETE" });
    if (response.ok) { toast.success(`${slot} photo restored`); await loadPubs(); }
    else toast.error("Photo restore failed");
  };
  const loadLogos = async () => {
    const response = await fetch("/api/payment-logo?format=json", { cache: "no-store" });
    if (response.ok) setLogos(await response.json());
  };

  const loadPaymentAccounts = async () => {
    const response = await fetch("/api/payment-settings", { cache: "no-store" });
    if (response.ok) setPaymentAccounts(await response.json());
  };

  const savePaymentAccounts = async () => {
    const response = await fetch("/api/payment-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(paymentAccounts) });
    if (response.ok) { setPaymentAccounts(await response.json()); toast.success("Payment accounts saved"); }
    else toast.error("Payment accounts could not be saved");
  };

  const deletePaymentAccount = async (account: "ccp" | "bank") => {
    const response = await fetch(`/api/payment-settings?account=${account}`, { method: "DELETE" });
    if (response.ok) { setPaymentAccounts((current) => ({ ...current, [account === "ccp" ? "ccpAccount" : "bankAccount"]: "" })); toast.success("Payment account removed"); }
    else toast.error("Payment account could not be removed");
  };

  const loadBranding = async () => { const response = await fetch("/api/site-settings", { cache: "no-store" }); if (response.ok) setBranding(await response.json()); };
  const uploadBranding = async (kind: "logo" | "background", file: File | undefined) => {
    if (!file) return;
    const formData = new FormData(); formData.append("kind", kind); formData.append("file", file);
    const response = await fetch("/api/site-settings", { method: "POST", body: formData });
    if (response.ok) { setBranding(await response.json()); toast.success(`${kind} updated`); } else toast.error("Branding update failed");
  };
  const resetBranding = async (kind: "logo" | "background") => {
    const response = await fetch(`/api/site-settings?kind=${kind}`, { method: "DELETE" });
    if (response.ok) { setBranding(await response.json()); toast.success(`${kind} restored`); } else toast.error("Branding restore failed");
  };
  const saveOpacity = async () => { const response = await fetch("/api/site-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ backgroundOpacity: branding.backgroundOpacity }) }); if (response.ok) { setBranding(await response.json()); toast.success("Background opacity saved"); } };
  const loadAnnouncements = async () => { const response = await fetch("/api/announcements", { cache: "no-store" }); if (response.ok) setAnnouncements(await response.json()); };
  const uploadAnnouncement = async (file?: File) => {
    if (!file) return;
    setAnnouncementUploading(true);
    const formData = new FormData(); formData.append("file", file); formData.append("title", announcementTitle);
    const response = await fetch("/api/announcements", { method: "POST", body: formData });
    setAnnouncementUploading(false);
    if (response.ok) { setAnnouncementTitle(""); toast.success("Announcement added"); await loadAnnouncements(); } else toast.error((await response.json()).error || "Announcement upload failed");
  };
  const deleteAnnouncement = async (id: string) => { const response = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" }); if (response.ok) { toast.success("Announcement deleted"); await loadAnnouncements(); } else toast.error("Announcement deletion failed"); };
  const updateAnnouncement = async (id: string, title: string, file?: File) => {
    const formData = new FormData(); formData.append("title", title); if (file) formData.append("file", file);
    const response = await fetch(`/api/announcements?id=${id}`, { method: "PUT", body: formData });
    if (response.ok) { setEditingAnnouncement(null); toast.success("Announcement updated"); await loadAnnouncements(); } else toast.error((await response.json()).error || "Announcement update failed");
  };

  const loadCategories = async () => {
    const response = await apiClient.get("/api/categories");
    if (response.ok) setCategories(await response.json());
  };

  const addCategory = async () => {
    const name = convertCategoryNameToURLFriendly(categoryName.trim());
    if (!name) return;
    const response = await apiClient.post("/api/categories", { name });
    if (!response.ok) {
      const result = await response.json();
      toast.error(result.error || "Category creation failed");
      return;
    }
    setCategoryName("");
    toast.success("Category added");
    await loadCategories();
  };

  const updateCategory = async (category: Category) => {
    const name = window.prompt("Enter the new category title", category.name);
    if (!name?.trim()) return;
    const response = await apiClient.put(`/api/categories/${category.id}`, { name: convertCategoryNameToURLFriendly(name.trim()) });
    if (!response.ok) {
      const result = await response.json();
      toast.error(result.error || "Category update failed");
      return;
    }
    toast.success("Category updated");
    await loadCategories();
  };

  const deleteCategory = async (category: Category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    const response = await apiClient.delete(`/api/categories/${category.id}`);
    if (!response.ok) {
      const result = await response.json();
      toast.error(result.error || "Category deletion failed");
      return;
    }
    toast.success("Category deleted");
    await loadCategories();
  };

  const uploadCategoryIcon = async (categoryId: string, file: File | undefined) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("icon", file);
    setCategoryIcons((current) => ({ ...current, [categoryId]: true }));
    const response = await fetch(`/api/category-icon?categoryId=${categoryId}`, { method: "POST", body: formData });
    setCategoryIcons((current) => ({ ...current, [categoryId]: false }));
    if (response.ok) toast.success("Category icon updated");
    else toast.error((await response.json()).error || "Icon upload failed");
  };

  const uploadLogo = async (slot: string, file: File | undefined) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);
    setUploading(slot);

    try {
      const response = await fetch(`/api/payment-logo?slot=${slot}`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Logo upload failed");
      }

      toast.success(`${slot} logo updated`);
      await loadLogos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logo upload failed");
    } finally {
      setUploading(null);
    }
  };

  const restoreLogo = async (slot: string) => {
    try {
      const response = await fetch(`/api/payment-logo?slot=${slot}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Logo restore failed");
      toast.success(`${slot} logo restored`);
      await loadLogos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logo restore failed");
    }
  };

  const addLogo = async (file: File | undefined) => {
    const name = window.prompt("Enter a name for the new payment logo");
    const slot = name?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!file || !slot) return;
    await uploadLogo(slot, file);
  };

  const removeLogo = async (slot: string) => {
    if (["visa", "mastercard", "edahabia"].includes(slot)) {
      await restoreLogo(slot);
      return;
    }
    try {
      const response = await fetch(`/api/payment-logo?slot=${slot}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Logo deletion failed");
      toast.success("Payment logo deleted");
      await loadLogos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logo deletion failed");
    }
  };

  return (
    <div className="bg-transparent flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      <main className="flex flex-col gap-y-6 w-full p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-semibold">Settings</h1><Link href="/" className="btn btn-outline">Back to main menu</Link></div>
        <button type="button" className="btn btn-primary w-fit" onClick={() => { setCategoriesOpen(!categoriesOpen); if (!categoriesOpen) loadCategories(); }}>
          {categoriesOpen ? "Close categories" : <><FaShapes aria-hidden="true" /> Manage categories</>}
        </button>
        {categoriesOpen && <section className="flex flex-col gap-y-4 max-w-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">Categories</h2>
          <div className="flex gap-2">
            <input className="input input-bordered w-full" value={categoryName} placeholder="New category title" onChange={(event) => setCategoryName(event.target.value)} />
            <button type="button" className="btn btn-primary" onClick={addCategory}>Add</button>
          </div>
          {categories.map((category) => (
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3" key={category.id}>
              <span className="capitalize font-semibold mr-auto">{category.name}</span>
              <input type="file" accept="image/svg+xml,image/png,image/jpeg,.svg,.png,.jpg,.jpeg" disabled={categoryIcons[category.id]} onChange={(event) => uploadCategoryIcon(category.id, event.target.files?.[0])} />
              <button type="button" className="btn btn-sm btn-outline" onClick={() => updateCategory(category)}>Modify title</button>
              <button type="button" className="btn btn-sm btn-error" onClick={() => deleteCategory(category)}>Delete</button>
            </div>
          ))}
        </section>}
        <button type="button" className="btn btn-primary w-fit" onClick={() => { setPubsOpen(!pubsOpen); if (!pubsOpen) loadPubs(); }}>
          {pubsOpen ? "Close manage pubs" : "Manage pubs"}
        </button>
        {pubsOpen && <section className="flex max-w-4xl flex-col gap-y-4 border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">Pubs</h2>
          <p className="text-gray-600">Upload as many photos as needed for the New and Promo slider.</p>
          <label className="btn btn-primary w-fit">
            Add photo
            <input className="hidden" type="file" accept="image/svg+xml,image/png,image/jpeg,.svg,.png,.jpg,.jpeg" disabled={pubUploading !== null} onChange={(event) => uploadPub(undefined, event.target.files?.[0])} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pubs.map((pub) => <div className="border border-gray-200 p-4" key={pub.slot}>
              <h3 className="font-semibold">{pub.slot}</h3>
              <img src={pub.image} alt={`${pub.slot} promo photo`} className="mt-3 h-36 w-full object-contain" />
              <input className="file-input file-input-bordered mt-3 w-full" type="file" accept="image/svg+xml,image/png,image/jpeg,.svg,.png,.jpg,.jpeg" disabled={pubUploading !== null} onChange={(event) => uploadPub(pub.slot, event.target.files?.[0])} />
              <button type="button" className="btn btn-sm btn-error mt-3" onClick={() => deletePub(pub.slot)}>Delete photo</button>
              {pubUploading === pub.slot && <p className="mt-2 text-sm text-gray-600">Uploading...</p>}
            </div>)}
          </div>
        </section>}
        <button type="button" className="btn btn-primary w-fit" onClick={() => { setPaymentLogosOpen(!paymentLogosOpen); if (!paymentLogosOpen) { loadLogos(); loadPaymentAccounts(); } }}>
          {paymentLogosOpen ? "Close payment methods" : "Manage payment methods"}
        </button>
        <button type="button" className="btn btn-primary w-fit" onClick={() => { setShippingPriceOpen(!shippingPriceOpen); if (!shippingPriceOpen) loadPaymentAccounts(); }}>
          {shippingPriceOpen ? "Close shipping price" : "Manage shipping price"}
        </button>
        {shippingPriceOpen && <section className="flex max-w-xl flex-col gap-y-4 border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">Shipping price</h2>
          <label className="form-control"><span className="label-text">Shipping price</span><input className="input input-bordered" type="number" min="0" step="1" value={paymentAccounts.shippingCost} onChange={(event) => setPaymentAccounts({ ...paymentAccounts, shippingCost: Math.max(0, Number(event.target.value) || 0) })} placeholder="5" /></label>
          <button type="button" className="btn btn-primary w-fit" onClick={savePaymentAccounts}>Save shipping price</button>
        </section>}
        {paymentLogosOpen && <div className="flex flex-col gap-y-4">
          <p className="text-gray-600">Replace, add, or delete payment logos using SVG, PNG, JPG, or JPEG files.</p>
          {logos.map((logo) => (
            <div className="max-w-xl border border-gray-200 p-6" key={logo.slot}>
              <h2 className="text-xl font-semibold capitalize">{logo.name} logo</h2>
              <div className="flex flex-wrap gap-3 items-center mt-5">
                <input className="file-input file-input-bordered w-full max-w-sm" type="file" accept="image/svg+xml,image/png,image/jpeg,.svg,.png,.jpg,.jpeg" disabled={uploading !== null} onChange={(event) => uploadLogo(logo.slot, event.target.files?.[0])} />
                <button type="button" className="btn btn-outline" onClick={() => removeLogo(logo.slot)}>Delete logo</button>
              </div>
              {uploading === logo.slot && <p className="mt-3 text-gray-600">Uploading...</p>}
            </div>
          ))}
          <button type="button" className="btn btn-primary w-fit" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Close add logo" : "Add another logo"}
          </button>
          {showAddForm && <div className="max-w-xl border border-dashed border-gray-400 p-6">
            <h2 className="text-xl font-semibold">Add payment logo</h2>
            <p className="mt-2 text-gray-600">Choose a name, then select an SVG, PNG, JPG, or JPEG file.</p>
            <input className="file-input file-input-bordered mt-5 w-full max-w-sm" type="file" accept="image/svg+xml,image/png,image/jpeg,.svg,.png,.jpg,.jpeg" disabled={uploading !== null} onChange={(event) => addLogo(event.target.files?.[0])} />
          </div>}
        </div>}
        {paymentLogosOpen && <section className="flex max-w-xl flex-col gap-y-4 border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">CCP and bank transfer accounts</h2>
          <p className="text-sm text-gray-600">These details appear to buyers only after they choose online payment. Leave them blank until verified.</p>
          <label className="form-control"><span className="label-text">CCP / BaridiMob account</span><input className="input input-bordered" value={paymentAccounts.ccpAccount} onChange={(event) => setPaymentAccounts({ ...paymentAccounts, ccpAccount: event.target.value })} placeholder="CCP account and RIP" /></label>
          <button type="button" className="btn btn-outline w-fit" onClick={() => deletePaymentAccount("ccp")}>Delete CCP account</button>
          <label className="form-control"><span className="label-text">Bank account</span><input className="input input-bordered" value={paymentAccounts.bankAccount} onChange={(event) => setPaymentAccounts({ ...paymentAccounts, bankAccount: event.target.value })} placeholder="Bank account / RIB" /></label>
          <button type="button" className="btn btn-outline w-fit" onClick={() => deletePaymentAccount("bank")}>Delete bank account</button>
          <button type="button" className="btn btn-primary w-fit" onClick={savePaymentAccounts}>Save payment accounts</button>
        </section>}
        <button type="button" className="btn btn-primary w-fit" onClick={() => { setBrandingOpen(!brandingOpen); if (!brandingOpen) loadBranding(); }}>
          {brandingOpen ? "Close Manage Logo" : "Manage Logo"}
        </button>
        {brandingOpen && <section className="grid max-w-4xl gap-6 border border-gray-200 p-6 md:grid-cols-2">
          <h2 className="text-xl font-semibold">Website logo and background</h2>
          <div><h2 className="text-xl font-semibold">Website logo</h2><img src={branding.logoPath} alt="Current website logo" className="mt-3 h-24 w-full object-contain" /><input className="file-input file-input-bordered mt-3 w-full" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadBranding("logo", event.target.files?.[0])} /><button type="button" className="btn btn-sm btn-outline mt-2" onClick={() => resetBranding("logo")}>Restore logo</button></div>
          <div><h2 className="text-xl font-semibold">Website background photo</h2><img src={branding.backgroundPath} alt="Current website background photo" className="mt-3 h-40 w-full object-cover" /><p className="mt-2 text-sm text-gray-600">Current uploaded background photo</p><input className="file-input file-input-bordered mt-3 w-full" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadBranding("background", event.target.files?.[0])} /><button type="button" className="btn btn-sm btn-outline mt-2" onClick={() => resetBranding("background")}>Restore background</button><label className="form-control mt-4"><span className="label-text">Background opacity: {Math.round(branding.backgroundOpacity * 100)}%</span><input type="range" min="0" max="1" step="0.05" value={branding.backgroundOpacity} onChange={(event) => setBranding({ ...branding, backgroundOpacity: Number(event.target.value) })} /><button type="button" className="btn btn-primary mt-2 w-fit" onClick={saveOpacity}>Save opacity</button></label></div>
        </section>}
        <button type="button" className="btn btn-primary w-fit" onClick={() => { setAnnouncementsOpen(!announcementsOpen); if (!announcementsOpen) loadAnnouncements(); }}>
          {announcementsOpen ? "Close manage announcements" : "Manage announcements"}
        </button>
        {announcementsOpen && <section className="flex max-w-5xl flex-col gap-5 border border-gray-200 p-6">
          <div><h2 className="text-xl font-semibold">Announcements</h2><p className="mt-2 text-gray-600">Add unlimited app promotions, product promotions, and announcements. Images and videos use the same single-item animation as New Products.</p></div>
          <div className="flex flex-wrap gap-3"><input className="input input-bordered" placeholder="Optional title" value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} /><label className="btn btn-primary">Add photo or video<input className="hidden" type="file" accept="image/*,video/*" disabled={announcementUploading} onChange={(event) => uploadAnnouncement(event.target.files?.[0])} /></label></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{announcements.map((item) => <AnnouncementEditor key={item.id} item={item} editing={editingAnnouncement === item.id} onEdit={() => setEditingAnnouncement(item.id)} onCancel={() => setEditingAnnouncement(null)} onSave={updateAnnouncement} onDelete={deleteAnnouncement} />)}</div>
        </section>}
        <BottomPagesManager />
      </main>
    </div>
  );
};

export default SettingsPage;
