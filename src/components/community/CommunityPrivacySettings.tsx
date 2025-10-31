'use client';

import { useState } from 'react';
import { Globe, Shield, Lock, AlertTriangle, Save } from 'lucide-react';
import { logError } from '@/lib/error-logger';


interface CommunityPrivacySettingsProps {
  currentPrivacy: 'PUBLIC' | 'GUARDED' | 'PRIVATE';
  onSave: (newPrivacy: 'PUBLIC' | 'GUARDED' | 'PRIVATE') => Promise<void>;
  isOwner: boolean;
}

export function CommunityPrivacySettings({ currentPrivacy, onSave, isOwner }: CommunityPrivacySettingsProps) {
  const [selectedPrivacy, setSelectedPrivacy] = useState<'PUBLIC' | 'GUARDED' | 'PRIVATE'>(currentPrivacy);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOwner) {
    return null;
  }

  const getAvailableOptions = () => {
    switch (currentPrivacy) {
      case 'PUBLIC':
        return ['PUBLIC', 'GUARDED', 'PRIVATE'];
      case 'GUARDED':
        return ['GUARDED', 'PRIVATE'];
      case 'PRIVATE':
        return ['PRIVATE'];
      default:
        return ['PUBLIC'];
    }
  };

  const getPrivacyDescription = (privacy: string) => {
    switch (privacy) {
      case 'PUBLIC':
        return 'All posts are viewable to any logged-in site member, even if they\'re not in the group.';
      case 'GUARDED':
        return 'Members can choose whether their posts are public or private. Non-members can see public posts only.';
      case 'PRIVATE':
        return 'NO posts or discussions are viewable to non-members. The group can be searched but content is hidden.';
      default:
        return '';
    }
  };

  const getWarningMessage = () => {
    if (selectedPrivacy === currentPrivacy) return null;
    
    if (selectedPrivacy === 'PRIVATE') {
      return 'Warning: Once you make this community private, it cannot be made public or guarded again. Members have submitted content expecting privacy.';
    }
    
    if (currentPrivacy === 'PUBLIC' && selectedPrivacy === 'GUARDED') {
      return 'Changing to guarded will allow members to make future posts private, but existing posts will remain public.';
    }
    
    return null;
  };

  const handleSave = async () => {
    if (selectedPrivacy === currentPrivacy) return;
    
    setIsSaving(true);
    try {
      await onSave(selectedPrivacy);
    } catch (error) {
      logError('Error updating privacy settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const availableOptions = getAvailableOptions();
  const warningMessage = getWarningMessage();

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="text-accent" size={20} />
        <h3 className="text-lg font-medium text-ink">Privacy Settings</h3>
      </div>

      <div className="space-y-4">
        {availableOptions.map((option) => (
          <label
            key={option}
            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedPrivacy === option
                ? 'border-accent bg-accent/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="privacy"
              value={option}
              checked={selectedPrivacy === option}
              onChange={(e) => setSelectedPrivacy(e.target.value as 'PUBLIC' | 'GUARDED' | 'PRIVATE')}
              className="sr-only"
            />
            
            <div className="flex-shrink-0 mt-1">
              {option === 'PUBLIC' && <Globe size={20} className="text-green-600" />}
              {option === 'GUARDED' && <Shield size={20} className="text-yellow-600" />}
              {option === 'PRIVATE' && <Lock size={20} className="text-red-600" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-ink">{option}</span>
                {option === currentPrivacy && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Current</span>
                )}
              </div>
              <p className="text-sm text-support leading-relaxed">
                {getPrivacyDescription(option)}
              </p>
            </div>
          </label>
        ))}
      </div>

      {warningMessage && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">Important Notice</p>
              <p className="text-sm text-yellow-700">{warningMessage}</p>
            </div>
          </div>
        </div>
      )}

      {selectedPrivacy !== currentPrivacy && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}