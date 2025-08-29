import React from 'react';
import { App as AntdApp } from 'antd';
import DataUploadSystem from './components/DataUploadSystem';
import './App.css';

function App() {
  return (
      <AntdApp>
        <div className="App">
          <main className="App-main">
            <DataUploadSystem/>
          </main>
        </div>
      </AntdApp>
   );
}

export default App;
