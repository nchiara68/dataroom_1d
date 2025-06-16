import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { StorageManager } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import outputs from '../amplify_outputs.json';
import { client } from './client';

// 🔧 Configure Amplify
Amplify.configure(outputs);
console.log('🔧 Amplify configured for Stage 1: Minimal Data Room');

// 🎨 Custom Authenticator Components
const components = {
  Header() {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem 1rem 1rem 1rem',
        backgroundColor: '#002b4b',
        color: 'white'
      }}>
        <img 
          src="/toknar-logo.svg" 
          alt="Toknar Logo" 
          style={{ 
            height: '48px',
            width: 'auto',
            marginBottom: '1rem',
            objectFit: 'contain'
          }} 
        />
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>
          📄 Data Room - Onboarding
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>
          Secure file uploads and management
        </p>
      </div>
    );
  },
  Footer() {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '1rem',
        fontSize: '0.8rem',
        color: '#6C757D'
      }}>
         📄 Data Room | Onboarding | Toknar © 2025
      </div>
    );
  }
};

// 📄 Type definitions - Following reference project pattern
interface UserProfileType {
  id: string;
  email: string;
  totalDocuments?: number | null;
  storageUsed?: number | null;
  lastActiveAt?: string | null;
  owner?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface DocumentType {
  id: string;
  name: string;
  key: string;
  size?: number | null;
  type?: string | null;
  uploadedAt?: string | null;
  status?: string | null;
  owner?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface UploadEvent {
  key?: string;
  result?: {
    key?: string;
    size?: number;
  };
  size?: number;
}

// 📄 Stage 1 Interface Component
function Stage1Interface() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [activeTab, setActiveTab] = useState<'upload' | 'documents'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<DocumentType[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // 🔄 Force refresh function
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 🔄 Manual refresh effect
  useEffect(() => {
    if (refreshKey > 0) {
      const refreshData = async () => {
        // Refresh profile
        try {
          const { data: profiles } = await client.models.UserProfile.list({
            filter: { owner: { eq: user.username } }
          });
          if (profiles.length > 0) {
            setUserProfile(profiles[0] as UserProfileType);
          }
        } catch (error) {
          console.error('Error refreshing user profile:', error);
        }

        // Refresh files
        try {
          const { data: documents } = await client.models.Document.list({
            filter: { owner: { eq: user.username } }
          });
          setUploadedFiles(documents as DocumentType[]);
        } catch (error) {
          console.error('Error refreshing uploaded files:', error);
        }
      };
      
      refreshData();
    }
  }, [refreshKey, user.username]);

  /* 
  // 🔍 Debug Stage 1
  const debugStage1 = async () => {
    console.log('🔍 Starting Stage 1 Debug Tests...');
    
    try {
      // Test 1: Database connectivity
      console.log('🔍 Test 1: Database connectivity...');
      const { data: documents } = await client.models.Document.list();
      const { data: profiles } = await client.models.UserProfile.list();
      
      console.log('✅ Database Status:');
      console.log(`  - Documents: ${documents.length}`);
      console.log(`  - Profiles: ${profiles.length}`);
      
      // Test 2: User-specific data
      console.log('🔍 Test 2: User-specific data...');
      const userDocs = documents.filter(d => d.owner === user.username);
      const userProfiles = profiles.filter(p => p.owner === user.username);
      
      console.log('✅ User Data:');
      console.log(`  - User Documents: ${userDocs.length}`);
      console.log(`  - User Profile: ${userProfiles.length > 0 ? 'Found' : 'Not Found'}`);
      
      const statusMessage = `🎉 Stage 1 Debug Complete!

Database Status:
📄 Total Documents: ${documents.length}
👤 Total Profiles: ${profiles.length}

Your Data:
📄 Your Documents: ${userDocs.length}
👤 Your Profile: ${userProfiles.length > 0 ? '✅ Found' : '❌ Not Found'}

System Status: ${documents.length > 0 || profiles.length > 0 ? '🎯 READY' : '⚠️ EMPTY (Upload files to test)'}`;
      
      alert(statusMessage);
      
    } catch (error) {
      console.error('❌ Stage 1 Debug FAILED:', error);
      alert(`❌ Debug Test Failed:\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck console for details.`);
    }
  };
  */

  // 🎯 Initial load effect
  useEffect(() => {
    console.log('🚀 Stage 1: Interface mounted for user:', user.signInDetails?.loginId);
    
    const loadProfile = async () => {
      try {
        const { data: profiles } = await client.models.UserProfile.list({
          filter: { owner: { eq: user.username } }
        });
        
        if (profiles.length > 0) {
          setUserProfile(profiles[0] as UserProfileType);
        } else {
          const newProfile = await client.models.UserProfile.create({
            email: user.signInDetails?.loginId || '',
            totalDocuments: 0,
            storageUsed: 0,
            lastActiveAt: new Date().toISOString(),
            owner: user.username
          });
          setUserProfile(newProfile.data as UserProfileType);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    const loadFiles = async () => {
      try {
        const { data: documents } = await client.models.Document.list({
          filter: { owner: { eq: user.username } }
        });
        setUploadedFiles(documents as DocumentType[]);
      } catch (error) {
        console.error('Error loading uploaded files:', error);
      }
    };
    
    const initializeData = async () => {
      await loadProfile();
      await loadFiles();
    };
    
    initializeData();
  }, [user.signInDetails?.loginId, user.username]);

  // 📁 Handle successful file upload
  const handleUploadSuccess = async (event: UploadEvent) => {
    console.log('📁 File uploaded successfully:', event);
    
    try {
      const fileKey = event.key || event.result?.key || 'unknown';
      const fileName = fileKey.split('/').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      const fileSize = event.size || event.result?.size || 0;
      
      const docResult = await client.models.Document.create({
        name: fileName,
        key: fileKey,
        size: fileSize,
        type: fileExtension,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
        owner: user.username
      });

      console.log('📁 Document created successfully:', docResult);

      if (userProfile) {
        await client.models.UserProfile.update({
          id: userProfile.id,
          totalDocuments: (userProfile.totalDocuments || 0) + 1,
          storageUsed: (userProfile.storageUsed || 0) + fileSize,
          lastActiveAt: new Date().toISOString()
        });
      }

      forceRefresh();
      
      alert(`✅ File uploaded successfully! 

📄 ${fileName} (${Math.round(fileSize / 1024)} KB)
🎯 Ready for access in the documents tab`);
    } catch (error) {
      console.error('Error creating document record:', error);
      alert('❌ Upload failed to create database record. Check console for details.');
    }
  };

  // 🗑️ Handle file deletion
  const handleDeleteFile = async (document: DocumentType) => {
    if (!confirm(`Delete "${document.name}"?\n\nThis action cannot be undone.`)) return;
    
    try {
      await client.models.Document.delete({ id: document.id });
      forceRefresh();
      
      alert(`✅ "${document.name}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('❌ Error deleting file. Please try again.');
    }
  };

  /* 
  // 💾 Export data
  const exportData = () => {
    const data = {
      profile: userProfile,
      documents: uploadedFiles,
      exportedAt: new Date().toISOString(),
      stage: 'Stage 1 Minimal',
      systemStatus: {
        documentsCount: uploadedFiles.length,
        totalStorage: userProfile?.storageUsed || 0
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-room-stage1-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Data exported successfully!');
  };
  */

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* 🏷️ Header */}
      <header style={{ 
        padding: '1rem', 
        backgroundColor: '#002b4b', 
        color: 'white',
        borderBottom: '2px solid #FF9900'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
              📄 Data Room | Onboarding
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
              👤 {user.signInDetails?.loginId} | 
              📄 {userProfile?.totalDocuments || 0} documents | 
              💾 {Math.round((userProfile?.storageUsed || 0) / 1024)} KB used
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* 
              <button
                onClick={debugStage1}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#17A2B8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🔍 Debug S1
              </button>
              */}
              
              <button
                onClick={forceRefresh}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#32b2e7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🔄 Refresh
              </button>
              
              {/* 
              <button
                onClick={exportData}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#28A745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                💾 Export
              </button>
              */}
              
              <button
                onClick={signOut}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#DC3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['upload', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'upload' | 'documents')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: activeTab === tab ? '#FF9900' : 'transparent',
                  color: 'white',
                  border: '1px solid #FF9900',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'upload' && '📁 Upload Files'}
                {tab === 'documents' && '📄 My Documents'}
              </button>
            ))}
          </div>
          
          <img 
            src="/TOKNAR-02-WHITE.png" 
            alt="Toknar Logo" 
            style={{ 
              height: '40px',
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        </div>
      </header>

      {/* 📄 Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {activeTab === 'upload' && (
          <>
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#F8F9FA',
              borderBottom: '1px solid #DEE2E6'
            }}>
              <strong style={{ color: '#002b4b' }}>📁 Document Upload</strong>
              <span style={{ marginLeft: '1rem', color: '#6C757D', fontSize: '0.9rem' }}>
                Upload files securely to your data room
              </span>
            </div>

            <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>📤 Upload New Documents</h3>
                <StorageManager
                  acceptedFileTypes={['.pdf', '.txt', '.doc', '.docx', '.jpg', '.png']}
                  path="documents/"
                  maxFileCount={10}
                  maxFileSize={10 * 1024 * 1024}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={(error) => {
                    console.error('Upload error:', error);
                    alert('❌ Upload failed. Please try again.');
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>📊 Your Storage Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#F8F9FA',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '2px solid #007BFF'
                  }}>
                    <div style={{ fontSize: '1.5rem' }}>📄</div>
                    <div style={{ fontWeight: 'bold', color: '#007BFF' }}>Documents</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {userProfile?.totalDocuments || 0}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#F8F9FA',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '2px solid #28A745'
                  }}>
                    <div style={{ fontSize: '1.5rem' }}>💾</div>
                    <div style={{ fontWeight: 'bold', color: '#28A745' }}>Storage Used</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {Math.round((userProfile?.storageUsed || 0) / 1024)} KB
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'documents' && (
          <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
            <h3 style={{ marginBottom: '1rem' }}>📄 Your Documents ({uploadedFiles.length})</h3>
            
            {uploadedFiles.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                backgroundColor: '#F8F9FA',
                borderRadius: '8px',
                color: '#6C757D'
              }}>
                <p>📄 No documents uploaded yet.</p>
                <p>Go to the "Upload Files" tab to add your first document!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {uploadedFiles.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #DEE2E6',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#002b4b' }}>
                        📄 {doc.name}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#6C757D', marginTop: '0.25rem' }}>
                        {doc.type} • {Math.round((doc.size || 0) / 1024)} KB • 
                        {doc.uploadedAt && new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#28A745', 
                        marginTop: '0.25rem',
                        fontWeight: 'bold'
                      }}>
                        ✅ Status: {doc.status}
                        {doc.updatedAt && ` • Updated: ${new Date(doc.updatedAt).toLocaleString()}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDeleteFile(doc)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#DC3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 📊 Status Bar */}
      <footer style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#E9ECEF',
        borderTop: '1px solid #DEE2E6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: '#6C757D'
      }}>
        <div>
          🎯 <strong>Stage 1 Complete</strong> • Next: Stage 2 Enhanced UI/UX
        </div>
        <div>
          📄 Documents: {uploadedFiles.length} | 
          💾 Storage: {Math.round((userProfile?.storageUsed || 0) / 1024)} KB |
          👤 User: {user.signInDetails?.loginId?.split('@')[0]}
        </div>
      </footer>
    </div>
  );
}

// 📄 Main App Component
function App() {
  return (
    <div className="App">
      <Authenticator 
        components={components}
        loginMechanisms={['email']}
      >
        {({ user }) => {
          console.log('✅ Stage 1: User authenticated:', user?.signInDetails?.loginId);
          return <Stage1Interface />;
        }}
      </Authenticator>
    </div>
  );
}

export default App;

console.log('✅ Stage 1: Minimal data room app loaded');