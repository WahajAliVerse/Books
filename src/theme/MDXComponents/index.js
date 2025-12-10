// Custom MDX components for the Physical AI & Humanoid Robotics book
// Located at src/theme/MDXComponents/index.js

import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';

// Wrapper for code blocks that adds safety annotations
const SafeCodeBlock = (props) => {
  const { children, className, ...rest } = props;
  
  // Check if this is a safety-critical code example
  const isSafetyCritical = className && className.includes('safety-critical');
  
  return (
    <div className="code-block-wrapper">
      {isSafetyCritical && (
        <div className="safety-alert warning">
          ⚠️ <strong>SAFETY-CRITICAL CODE:</strong> This code implements safety functions. 
          Verify thoroughly before deployment.
        </div>
      )}
      <CodeBlock className={className} {...rest}>
        {children}
      </CodeBlock>
    </div>
  );
};

// Custom component for displaying ROS message types
const ROSMessage = ({ name, fields, description }) => {
  return (
    <div className="ros-message">
      <h4>ROS Message: {name}</h4>
      <p>{description}</p>
      <ul>
        {fields && fields.map((field, index) => (
          <li key={index}>
            <code>{field.type} {field.name}</code> - {field.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Custom component for displaying URDF examples
const URDFLink = ({ name, visual, collision, inertial, description }) => {
  return (
    <div className="urdf-example">
      <h4>URDF Link: {name}</h4>
      {description && <p>{description}</p>}
      <div className="urdf-section">
        <h5>Visual:</h5>
        <pre><code>{visual}</code></pre>
      </div>
      <div className="urdf-section">
        <h5>Collision:</h5>
        <pre><code>{collision}</code></pre>
      </div>
      <div className="urdf-section">
        <h5>Inertial:</h5>
        <pre><code>{inertial}</code></pre>
      </div>
    </div>
  );
};

// Custom component for safety annotations and warnings
const SafetyAnnotation = ({ type = 'info', children }) => {
  const alertClasses = {
    info: 'safety-alert info',
    warning: 'safety-alert warning', 
    error: 'safety-alert error',
    success: 'safety-alert success'
  };
  
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  };
  
  return (
    <div className={alertClasses[type]}>
      <span className="alert-icon">{icons[type]}</span>
      <div className="alert-content">{children}</div>
    </div>
  );
};

// Re-export default components while adding custom ones
const DefaultThemeComponents = require('@theme-original/MDXComponents');

export default {
  // Re-export all default Docusaurus components
  ...DefaultThemeComponents,
  
  // Add our custom components
  CodeBlock: SafeCodeBlock,
  ROSMessage,
  URDFLink, 
  SafetyAnnotation,
};