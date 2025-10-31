'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Camera, Save, X, BookOpen, Eye, MessageSquare, Calendar, Send } from 'lucide-react';
import Image from 'next/image';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  birthday?: string;
  pronouns?: string;
  role: string;
  createdAt: string;
  _count: {
    works: number;
    followers: number;
    following: number;
  };
}

interface Work {
  id: string;
  title: string;
  description?: string;
  status: string;
  viewCount: number;
  commentCount: number;
  publishedAt?: string;
  updatedAt: string;
}

interface ActivityItem {
  id: string;
  type: 'work' | 'comment' | 'follow' | 'update';
  content: string;
  timestamp: string;
  link?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // New state for works and activity
  const [publicWorks, setPublicWorks] = useState<Work[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);
  const [activeTab, setActiveTab] = useState<'works' | 'activity'>('works');

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to load profile');
        }

        const data = await response.json();
        setUser(data);
        setDisplayName(data.displayName);
        setBio(data.bio || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Load mock public works and activity
  useEffect(() => {
    if (user) {
      // Mock public works data
      setPublicWorks([
        {
          id: '1',
          title: 'The Digital Divide in Modern Society',
          description: 'An analysis of technology access inequality and its societal impact.',
          status: 'PUBLISHED',
          viewCount: 1234,
          commentCount: 42,
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'Building Sustainable Communities',
          description: 'Exploring grassroots approaches to environmental sustainability.',
          status: 'PUBLISHED',
          viewCount: 856,
          commentCount: 28,
          publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
      
      // Mock activity feed
      setActivityFeed([
        {
          id: '1',
          type: 'work',
          content: 'Published a new article: "The Digital Divide in Modern Society"',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          link: '/works/1',
        },
        {
          id: '2',
          type: 'comment',
          content: 'Commented on "Understanding Climate Change"',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          link: '/works/3',
        },
        {
          id: '3',
          type: 'follow',
          content: 'Started following Sarah Martinez',
          timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          link: '/users/sarah',
        },
      ]);
    }
  }, [user]);
  
  const handlePostUpdate = async () => {
    if (!newUpdate.trim()) return;
    
    setIsPostingUpdate(true);
    try {
      // Mock posting - in real app, this would call an API
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: 'update',
        content: newUpdate,
        timestamp: new Date().toISOString(),
      };
      
      setActivityFeed(prev => [newActivity, ...prev]);
      setNewUpdate('');
      setSuccessMessage('Update posted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError('Failed to post update');
    } finally {
      setIsPostingUpdate(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const formData = new FormData();
      formData.append('displayName', displayName);
      formData.append('bio', bio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDisplayName(user?.displayName || '');
    setBio(user?.bio || '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-black mb-4">Profile Not Found</h1>
          <button
            onClick={() => router.push('/library')}
            className="px-4 py-2 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-medium text-black">My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 text-green-800">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-800">
            {error}
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white border-2 border-black p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-black flex items-center justify-center text-white text-4xl font-medium overflow-hidden">
                  {avatarPreview || user.avatarUrl ? (
                    <Image
                      src={avatarPreview || user.avatarUrl!}
                      alt={user.displayName}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} />
                  )}
                </div>
                {isEditing && (
                  <>
                    <label className="absolute bottom-0 right-0 bg-gray-400 text-white p-2 rounded-full cursor-not-allowed opacity-50" title="Photo uploads coming soon">
                      <Camera size={20} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled
                      />
                    </label>
                  </>
                )}
              </div>
              {isEditing && (
                <p className="mt-2 text-xs text-gray-600 text-center">
                  Photo uploads coming soon
                </p>
              )}
              {avatarFile && (
                <p className="mt-2 text-sm text-gray-600">New image selected</p>
              )}
            </div>

            {/* Profile Information */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Your display name"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      maxLength={500}
                      className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black resize-none"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="mt-1 text-sm text-gray-600">
                      {bio.length}/500 characters
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <Save size={16} />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-white text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Display Name */}
                  <div>
                    <h2 className="text-2xl font-medium text-black">{user.displayName}</h2>
                    <p className="text-gray-600">@{user.username}</p>
                  </div>

                  {/* Bio */}
                  <div>
                    <h3 className="text-sm font-medium text-black mb-1">Bio</h3>
                    {user.bio ? (
                      <p className="text-gray-800 leading-relaxed">{user.bio}</p>
                    ) : (
                      <p className="text-gray-500 italic">No bio added yet.</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t-2 border-black">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-medium text-black">{user._count.works}</div>
                        <div className="text-sm text-gray-600">Works</div>
                      </div>
                      <div>
                        <div className="text-2xl font-medium text-black">{user._count.followers}</div>
                        <div className="text-sm text-gray-600">Followers</div>
                      </div>
                      <div>
                        <div className="text-2xl font-medium text-black">{user._count.following}</div>
                        <div className="text-sm text-gray-600">Following</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Details (Read-Only) */}
          {!isEditing && (
            <div className="mt-6 pt-6 border-t-2 border-black">
              <h3 className="text-lg font-medium text-black mb-4">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 text-black font-medium">{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 text-black font-medium">{user.phoneNumber}</span>
                  </div>
                )}
                {user.pronouns && (
                  <div>
                    <span className="text-gray-600">Pronouns:</span>
                    <span className="ml-2 text-black font-medium">{user.pronouns}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Role:</span>
                  <span className="ml-2 text-black font-medium capitalize">{user.role.toLowerCase()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Member Since:</span>
                  <span className="ml-2 text-black font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Latest Public Works & Activity Feed Tabs */}
        <div className="mt-8">
          {/* Tab Navigation */}
          <div className="border-b-2 border-black mb-6">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('works')}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === 'works'
                    ? 'border-b-2 border-black -mb-0.5 text-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <BookOpen size={18} />
                Latest Public Works
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-black -mb-0.5 text-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Calendar size={18} />
                Activity Feed
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'works' && (
            <div>
              {publicWorks.length === 0 ? (
                <div className="text-center py-12 border-2 border-black p-6">
                  <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 mb-2">No public works yet</p>
                  <p className="text-sm text-gray-500">
                    Your published works will appear here
                  </p>
                  <Link
                    href="/atelier"
                    className="inline-block mt-4 px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    Create Your First Work
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {publicWorks.map((work) => (
                    <Link
                      key={work.id}
                      href={`/works/${work.id}`}
                      className="block border-2 border-black p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-black mb-2">
                            {work.title}
                          </h3>
                          {work.description && (
                            <p className="text-gray-600 mb-3">{work.description}</p>
                          )}
                        </div>
                        <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Published
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Eye size={16} />
                          <span>{work.viewCount.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} />
                          <span>{work.commentCount} comments</span>
                        </div>
                        {work.publishedAt && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>
                              {new Date(work.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                  
                  {publicWorks.length >= 2 && (
                    <Link
                      href={`/users/${user?.username}`}
                      className="block text-center py-4 border-2 border-black hover:bg-gray-50 transition-colors font-medium"
                    >
                      View All Works →
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              {/* Post Update Box */}
              <div className="mb-6 border-2 border-black p-4">
                <h3 className="font-medium text-black mb-3">Share an Update</h3>
                <div className="space-y-3">
                  <textarea
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder="What are you working on? Share your thoughts..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {newUpdate.length}/500 characters
                    </span>
                    <button
                      onClick={handlePostUpdate}
                      disabled={!newUpdate.trim() || isPostingUpdate}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                      {isPostingUpdate ? 'Posting...' : 'Post Update'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              {activityFeed.length === 0 ? (
                <div className="text-center py-12 border-2 border-black p-6">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 mb-2">No activity yet</p>
                  <p className="text-sm text-gray-500">
                    Your activity will appear here as you interact with the community
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityFeed.map((activity) => (
                    <div
                      key={activity.id}
                      className="border-2 border-black p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-accent"></div>
                        <div className="flex-1">
                          {activity.link ? (
                            <Link href={activity.link} className="hover:underline">
                              <p className="text-black">{activity.content}</p>
                            </Link>
                          ) : (
                            <p className="text-black">{activity.content}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
