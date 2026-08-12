import React from 'react';

export const HashTableCanvas = ({ buckets, hashFunction, currentKey, currentHash, collisionResolution = [] }) => {
  return (
    <div className="hash-table-visual animate-fade-in">
      {hashFunction && (
        <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '16px', fontFamily: 'var(--font-mono)', fontSize: '14px', textAlign: 'center' }}>
          h(key) = key % {buckets.length}
          <br/>
          {currentKey !== null && (
            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
              h({currentKey}) = {currentHash}
            </span>
          )}
        </div>
      )}

      {buckets.map((chain, index) => {
        const isTargetBucket = index === currentHash;
        const isCollision = collisionResolution.includes(index);

        return (
          <div key={index} className="hash-bucket">
            <div 
              className="bucket-index" 
              style={{
                borderColor: isTargetBucket ? 'var(--accent-primary)' : (isCollision ? 'var(--error)' : 'var(--border-primary)'),
                color: isTargetBucket ? 'var(--accent-primary)' : (isCollision ? 'var(--error)' : 'inherit'),
              }}
            >
              {index}
            </div>
            
            {chain && chain.length > 0 ? (
              <div className="bucket-chain">
                {chain.map((item, i) => (
                  <div key={i} className="bucket-item" style={{ animation: 'fadeIn 0.3s ease' }}>
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>Empty</div>
            )}
          </div>
        );
      })}
    </div>
  );
};
