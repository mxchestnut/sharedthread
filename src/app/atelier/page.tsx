'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Plus,
  ChevronRight,
  ArrowLeft,
  Target,
  Folder,
  X
} from 'lucide-react';
import { logInfo } from '@/lib/error-logger';
import { PROJECT_TEMPLATES } from '@/types/project-templates';
import { type Project } from '@/types/project-system';

// Using imported Project type from project-system.ts

export default function AtelierPage() {
  // Mock projects for demo
  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'The Digital Divide',
      description: 'A research project exploring technology access inequality',
      authorId: 'user-1',
      templateId: 'business-plan',
      status: 'ACTIVE',
      progress: 45,
      settings: {},
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-22T00:00:00Z',
      _count: { categories: 3, articles: 8 }
    },
    {
      id: '2',
      title: 'Urban Stories Collection',
      description: 'A series of interconnected stories about urban life',
      authorId: 'user-1',
      templateId: 'creative-writing',
      status: 'ACTIVE',
      progress: 72,
      settings: {},
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-24T00:00:00Z',
      _count: { categories: 5, articles: 12 }
    }
  ];

  const [projects] = useState<Project[]>(mockProjects);
  const [selectedProject] = useState<Project | null>(mockProjects[0] || null);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  // Template selection modal
  if (showTemplateSelection) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full py-8 px-6">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setShowTemplateSelection(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-medium text-ink">Choose a Project Template</h1>
              <p className="text-support">Select a template to get started with tailored prompts for your project type.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {PROJECT_TEMPLATES.map((template) => {
              // Get unique categories for this template to show structure
              const categories = [...new Set(template.prompts.map(p => p.category))];
              
              return (
                <div
                  key={template.id}
                  onClick={() => {
                    setShowTemplateSelection(false);
                    // TODO: Create new project with selected template
                  }}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-accent hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-ink mb-2">{template.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-support mb-3">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {template.category}
                        </span>
                        <span>•</span>
                        <span>{template.estimatedDuration}</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-support group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-support leading-relaxed mb-4">{template.description}</p>
                  
                  {/* Show structure preview for research project */}
                  {template.id === 'research-project' && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-xs font-medium text-ink mb-2">Project Structure:</h4>
                      <div className="text-xs text-support space-y-1">
                        <div>• {categories.length} major sections</div>
                        <div>• {template.prompts.length} guided article templates</div>
                        <div>• Complete methodology framework</div>
                        <div>• Data collection & analysis tools</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-support">
                      <span className="font-medium">{template.prompts.length} articles</span> • {categories.length} sections
                    </span>
                    <span className="text-accent text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Get Started →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Show project dashboard if user has projects, otherwise show template selection
  if (projects.length === 0 && !showTemplateSelection) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="w-full py-16 px-6 pr-20 text-center">
          <div className="mb-12">
            <Folder size={64} className="mx-auto text-gray-400 mb-6" />
            <h1 className="text-4xl font-bold text-ink mb-4">Welcome to Your Atelier</h1>
            <p className="text-support text-lg leading-relaxed max-w-3xl mx-auto mb-8">
              Your creative workspace for structured projects and focused writing. Choose a project template to get started with guided prompts, or create standalone articles with templates designed for specific purposes.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => window.location.href = '/atelier/create'}
                className="px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors font-medium"
              >
                Start New Project
              </button>
              <button 
                onClick={() => window.location.href = '/atelier/templates/articles'}
                className="px-6 py-3 border-2 border-accent text-accent rounded-md hover:bg-accent/5 transition-colors font-medium"
              >
                Write New Article
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {PROJECT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  window.location.href = `/atelier/create?template=${template.id}`;
                }}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-accent hover:shadow-md transition-all cursor-pointer group text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-ink mb-2">{template.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-support mb-3">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {template.category}
                      </span>
                      <span>•</span>
                      <span>{template.estimatedDuration}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-support group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-support leading-relaxed mb-4">{template.description}</p>
                <div className="text-sm text-support">
                  <span className="font-medium">{template.prompts.length} prompts</span> to guide your process
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Template selection modal
  if (showTemplateSelection) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full py-8 px-6">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setShowTemplateSelection(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-medium text-ink">Choose a Project Template</h1>
              <p className="text-support">Select a template to get started with tailored prompts for your project type.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {PROJECT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  setShowTemplateSelection(false);
                  // TODO: Create new project with template
                }}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-accent hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-ink mb-2">{template.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-support mb-3">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {template.category}
                      </span>
                      <span>•</span>
                      <span>{template.estimatedDuration}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-support group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-support leading-relaxed mb-4">{template.description}</p>
                <div className="text-sm text-support">
                  <span className="font-medium">{template.prompts.length} prompts</span> to guide you through the process
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Create project from template
  const createProjectFromTemplate = (template: typeof PROJECT_TEMPLATES[0]) => {
    // For demo, just close modal - in real app this would create the project
    setShowTemplateSelection(false);
    logInfo('Creating project from template:', template);
  };

  // Main Project Dashboard (Spacious Layout)
  return (
    <div className="min-h-screen bg-background">
      {/* Template Selection Modal */}
      {showTemplateSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-ink">Choose Project Template</h2>
                <button
                  onClick={() => setShowTemplateSelection(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {PROJECT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => createProjectFromTemplate(template)}
                    className="text-left p-4 border border-border rounded-lg hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <FileText size={24} className="text-accent mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-ink mb-1">{template.name}</h3>
                        <p className="text-sm text-support mb-2">{template.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-support">{template.category}</span>
                          <span className="text-xs text-support">•</span>
                          <span className="text-xs text-support">{template.prompts.length} prompts</span>
                          <span className="text-xs text-support">•</span>
                          <span className="text-xs text-support">{template.estimatedDuration}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Main Content Area - Full Width */}
      <div className="w-full px-6 py-8 pr-20">
        <div className="w-full">
        {selectedProject ? (
          <>
            {/* Project Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-medium text-ink mb-3">{selectedProject.title}</h2>
                  <p className="text-support leading-relaxed max-w-4xl text-lg">{selectedProject.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 border border-border rounded-md hover:bg-gray-50 transition-colors">
                    Export
                  </button>
                  <button className="px-4 py-2 border border-border rounded-md hover:bg-gray-50 transition-colors">
                    Share
                  </button>
                  <button 
                    onClick={() => window.location.href = '/atelier/create'}
                    className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    New Project
                  </button>
                </div>
              </div>

              {/* Stats Cards - More Spacious */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white border border-border rounded-xl p-6 text-center">
                  <div className="text-3xl font-medium text-ink mb-1">{selectedProject._count?.articles || 0}</div>
                  <div className="text-sm text-support">Articles</div>
                </div>
                <div className="bg-white border border-border rounded-xl p-6 text-center">
                  <div className="text-3xl font-medium text-accent mb-1">{selectedProject.progress}%</div>
                  <div className="text-sm text-support">Complete</div>
                </div>
                <div className="bg-white border border-border rounded-xl p-6 text-center">
                  <div className="text-3xl font-medium text-ink mb-1">4.2k</div>
                  <div className="text-sm text-support">Words</div>
                </div>
                <div className="bg-white border border-border rounded-xl p-6 text-center">
                  <div className="text-3xl font-medium text-ink mb-1">12</div>
                  <div className="text-sm text-support">Days Active</div>
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-medium text-ink">Projects</h3>
                <button 
                  onClick={() => window.location.href = '/atelier/create'}
                  className="px-4 py-2 border border-border rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  New Project
                </button>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => window.location.href = `/atelier/project/${project.id}`}
                    className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-ink group-hover:text-accent transition-colors mb-1">{project.title}</h4>
                        <div className="text-xs text-support">
                          {project._count?.categories || 0} sections • {project._count?.articles || 0} articles
                        </div>
                      </div>
                      <span className="text-xs text-support">{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-support mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {project.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-accent h-2 rounded-full transition-all" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-support">{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add new project card */}
                <div 
                  onClick={() => window.location.href = '/atelier/create'}
                  className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[200px]"
                >
                  <Plus size={32} className="mx-auto text-support group-hover:text-accent mb-3 transition-colors" />
                  <h4 className="font-medium text-ink mb-2">Start New Project</h4>
                  <p className="text-sm text-support text-center">Choose from research, business, creative, or custom project templates</p>
                </div>
              </div>
            </div>

            {/* Articles Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-medium text-ink">Recent Articles</h3>
                <button 
                  onClick={() => window.location.href = '/atelier/templates/articles'}
                  className="px-4 py-2 border border-border rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  New Article
                </button>
              </div>

              {/* Articles in a more spacious grid */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Sample articles for demo */}
                <div 
                  onClick={() => window.location.href = '/atelier/article/1'}
                  className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-blue-600" />
                      <div>
                        <h4 className="font-medium text-ink group-hover:text-accent transition-colors">Executive Summary</h4>
                        <div className="text-xs text-support mt-1">Market Analysis</div>
                      </div>
                    </div>
                    <span className="text-xs text-support">2 days ago</span>
                  </div>
                  <p className="text-sm text-support mb-4 line-clamp-2">Overview of the business concept, target market, and key success factors...</p>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Complete</span>
                    <span className="text-xs text-support">1,247 words</span>
                  </div>
                </div>

                <div 
                  onClick={() => window.location.href = '/atelier/article/2'}
                  className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-ink group-hover:text-accent transition-colors">Financial Projections</h4>
                        <div className="text-xs text-support mt-1">Financial Projections</div>
                      </div>
                    </div>
                    <span className="text-xs text-support">1 week ago</span>
                  </div>
                  <p className="text-sm text-support mb-4 line-clamp-2">Revenue forecasts, expense projections, and break-even analysis...</p>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">In Progress</span>
                    <span className="text-xs text-support">892 words</span>
                  </div>
                </div>

                <div 
                  onClick={() => window.location.href = '/atelier/article/new'}
                  className="bg-white border-2 border-dashed border-border rounded-xl p-6 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer text-center"
                >
                  <div className="py-8">
                    <Plus size={32} className="mx-auto text-support mb-3" />
                    <h4 className="font-medium text-ink mb-2">Create New Article</h4>
                    <p className="text-sm text-support">Add content to your project</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity - Horizontal Layout */}
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="text-lg font-medium text-ink mb-4">Recent Activity</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-ink">Executive Summary completed</div>
                    <div className="text-xs text-support mt-1">2 days ago</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-ink">Started Financial Projections</div>
                    <div className="text-xs text-support mt-1">1 week ago</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-ink">Created new project</div>
                    <div className="text-xs text-support mt-1">2 weeks ago</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // No Project Selected - More Spacious
          <div className="text-center py-20">
            <Target size={64} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-medium text-ink mb-3">Select a Project</h2>
            <p className="text-support mb-8 max-w-lg mx-auto text-lg leading-relaxed">
              Choose a project from the dropdown above to view its articles and progress, or create a new project to get started.
            </p>
            <button
              onClick={() => setShowTemplateSelection(true)}
              className="px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors inline-flex items-center gap-2 text-lg"
            >
              <Plus size={20} />
              Create New Project
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}