/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Bell, Shield, Smartphone, Globe, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-gray-500 mt-1">Configure your personal preferences and system notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <nav className="flex flex-col space-y-1">
            <Button variant="secondary" className="justify-start gap-3">
              <User className="w-4 h-4" />
              Account Profile
            </Button>
            <Button variant="ghost" className="justify-start gap-3">
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
            <Button variant="ghost" className="justify-start gap-3">
              <Shield className="w-4 h-4" />
              Security & Privacy
            </Button>
            <Button variant="ghost" className="justify-start gap-3">
              <Smartphone className="w-4 h-4" />
              Device Management
            </Button>
            <Button variant="ghost" className="justify-start gap-3 text-gray-500">
              <Globe className="w-4 h-4" />
              Language & Region
            </Button>
          </nav>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and how others see you on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                  <input type="text" defaultValue="ICT" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                  <input type="text" defaultValue="Administrator" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                <input type="email" defaultValue="admin@ustp.edu.ph" disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed" />
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-100 bg-rose-50/20">
            <CardHeader>
              <CardTitle className="text-rose-900">Danger Zone</CardTitle>
              <CardDescription className="text-rose-700/70">Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Deactivate Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
