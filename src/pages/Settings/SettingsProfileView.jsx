// src/pages/settings/SettingsProfileView.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProfile, patchProfile } from "../../api/settingsProfile";

const SmallInlineEdit = ({ value, onSave, label, name }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? "");

  useEffect(() => setVal(value ?? ""), [value]);

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <div>{value || "-"}</div>
        <button onClick={() => setEditing(true)} className="text-sm px-2 py-1 border rounded">
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input className="border rounded px-2 py-1" value={val} onChange={(e) => setVal(e.target.value)} />
      <button
        onClick={() => {
          onSave({ [name]: val });
          setEditing(false);
        }}
        className="px-2 py-1 bg-blue-600 text-white rounded"
      >
        Save
      </button>
      <button onClick={() => setEditing(false)} className="px-2 py-1 border rounded">
        Cancel
      </button>
    </div>
  );
};

const SettingsProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProfile(id);
      const data = res?.data?.data ?? res?.data;
      setProfile(data);
    } catch (err) {
      console.error(err);
      window.alert("Failed to load profile");
      navigate("/settings/profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePatch = async (patch) => {
    const confirmEdit = window.confirm("Apply this change?");
    if (!confirmEdit) return;

    try {
      const res = await patchProfile(id, patch);
      const data = res?.data?.data ?? res?.data;
      setProfile(data);
      window.alert("Updated");
    } catch (err) {
      console.error("Patch failed", err);
      window.alert("Patch failed");
    }
  };

  if (loading || !profile) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Profile — {profile.fullName}</h1>
        <div className="flex gap-2">
          <Link to={`/settings/profile/${profile.userId}/edit`} className="px-3 py-1 border rounded">
            Edit
          </Link>
          <Link to="/settings/profile" className="px-3 py-1 border rounded">
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">User ID</div>
            <div className="font-medium">{profile.userId}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Full name</div>
            <SmallInlineEdit value={profile.fullName} name="fullName" onSave={handlePatch} />
          </div>

          <div>
            <div className="text-sm text-gray-500">Phone</div>
            <SmallInlineEdit value={profile.phone} name="phone" onSave={handlePatch} />
          </div>

          <div>
            <div className="text-sm text-gray-500">Timezone</div>
            <SmallInlineEdit value={profile.timezone} name="timezone" onSave={handlePatch} />
          </div>

          <div>
            <div className="text-sm text-gray-500">Locale</div>
            <SmallInlineEdit value={profile.locale} name="locale" onSave={handlePatch} />
          </div>

          <div>
            <div className="text-sm text-gray-500">Updated At</div>
            <div>{profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfileView;
