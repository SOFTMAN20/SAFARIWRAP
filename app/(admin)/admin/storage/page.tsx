'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HardDrive,
  FolderOpen,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Download,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getStorageStats, STORAGE_FOLDERS } from '@/lib/storage';

export default function StoragePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getStorageStats();
    setStats(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-forest mx-auto mb-4" />
              <p className="text-stone">Loading storage statistics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-black text-forest flex items-center gap-2">
              <HardDrive className="w-8 h-8" />
              Storage Management
            </h1>
            <p className="text-stone mt-1">Monitor and manage file storage</p>
          </div>
          <Button onClick={loadStats} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone">Total Files</p>
                    <p className="text-3xl font-black text-forest mt-1">
                      {stats?.totalFiles || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-forest" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone">Total Size</p>
                    <p className="text-3xl font-black text-forest mt-1">
                      {stats?.totalSizeMB?.toFixed(2) || 0} MB
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-savanna/10 flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-savanna" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone">Storage Used</p>
                    <p className="text-3xl font-black text-forest mt-1">
                      {((stats?.totalSizeMB || 0) / 1024).toFixed(2)} GB
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Folder Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Storage by Folder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(STORAGE_FOLDERS).map(([key, folder], index) => {
                  const folderStats = stats?.byFolder?.[folder] || { count: 0, sizeMB: 0 };
                  const percentage = stats?.totalSizeMB
                    ? ((folderStats.sizeMB / stats.totalSizeMB) * 100).toFixed(1)
                    : 0;

                  return (
                    <motion.div
                      key={folder}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-forest" />
                          </div>
                          <div>
                            <p className="font-semibold text-forest capitalize">{folder}</p>
                            <p className="text-xs text-stone">
                              {folderStats.count} files • {folderStats.sizeMB.toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{percentage}%</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-forest h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {index < Object.keys(STORAGE_FOLDERS).length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Storage Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Storage Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-forest mb-2">Bucket Configuration</h3>
                <ul className="space-y-1 text-sm text-stone">
                  <li>• Bucket Name: <code className="bg-gray-100 px-2 py-1 rounded">safariwrap-assets</code></li>
                  <li>• Public Access: Enabled</li>
                  <li>• Max File Size: 10 MB (photos), 5 MB (logos), 15 MB (wraps)</li>
                  <li>• Allowed Types: JPEG, PNG, WebP, GIF</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-forest mb-2">Folder Structure</h3>
                <ul className="space-y-1 text-sm text-stone">
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">reviews/</code> - Guest review photos</li>
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">logos/</code> - Operator logos</li>
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">wraps/</code> - Generated wrap images</li>
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">temp/</code> - Temporary files</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-forest mb-2">Storage Limits</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Free Tier:</strong> 1 GB storage, 2 GB bandwidth/month
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    <strong>Pro Plan ($25/month):</strong> 100 GB storage, 200 GB bandwidth/month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
