import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Phone, Mail, Clock, AlertTriangle } from 'lucide-react';

const HelpIcon = () => {
  const [isOpen, setIsOpen] = useState(false);

  const emergencyContact = {
    name: 'Dr. Sarah Johnson',
    email: 'dr.sarah.johnson@example.com',
    phone: '+1-555-0123',
    specialization: 'Licensed Clinical Psychologist',
    availability: '24/7 Crisis Support',
    message: 'If you are experiencing a mental health crisis, please contact me immediately. Your safety and well-being are my top priority.'
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
            aria-label="Emergency Help"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Emergency Support
            </DialogTitle>
            <DialogDescription>
              If you're experiencing a mental health crisis, help is available 24/7.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-red-600">{emergencyContact.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {emergencyContact.specialization}
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {emergencyContact.availability}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">
                  {emergencyContact.message}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <a 
                      href={`tel:${emergencyContact.phone}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {emergencyContact.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <a 
                      href={`mailto:${emergencyContact.email}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {emergencyContact.email}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> If you're having thoughts of self-harm or suicide, 
                please call your local crisis hotline or emergency services immediately.
              </p>
            </div>

            <div className="text-xs text-gray-500 text-center">
              This is a demo contact. In a real application, this would connect to actual mental health professionals.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HelpIcon; 