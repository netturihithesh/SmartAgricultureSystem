  return (
    <div className="antigravity-dashboard">
      <div className="dashboard-grid">
        
        {/* LEFT COLUMN */}
        <div className="left-column">
          
          {/* HERO CARD */}
          <div className="neo-card hero-card">
            <div className="hero-glow"></div>
            <div className="hero-header">
              <h1>Hi, {profile?.full_name || 'Hitheshsena'}</h1>
              <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 22l10-4 10 4L12 2z"/></svg>
            </div>
            <div className="hero-sub">ACTIVE FARMER</div>
            <h2 className="hero-crop-title">{selectedCrop ? selectedCrop.crop_name : 'No Active Crop'}</h2>
            
            {selectedCrop && (
              <div className="hero-pill">{currentStage?.title || 'Initialization'}</div>
            )}
            
            {selectedCrop && (
              <div className="hero-stats-grid">
                <div>
                  <div className="stat-label">EXPECTED HARVEST</div>
                  <div className="stat-value">{new Date(new Date(cropStartDate).getTime() + selectedCrop.total_duration_days * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="stat-label">CURRENT STAGE</div>
                  <div className="stat-value">{currentStage?.stage_id || 1} of {selectedCrop.stages.length} Stages</div>
                </div>
                <div>
                  <div className="stat-label">TOTAL DAYS</div>
                  <div className="stat-value">Day {daysPassed} / {selectedCrop.total_duration_days}</div>
                </div>
              </div>
            )}
            
            <div className="hero-actions">
              {selectedCrop ? (
                <>
                  <button className="btn-outline" onClick={() => navigate('/dashboard/calendar')}>View Full Journey</button>
                  {userCrops.length === 2 ? (
                     <button className="btn-filled" onClick={handleSwapCrop}>Swap Crop</button>
                  ) : (
                     <button className="btn-filled" onClick={() => navigate('/add-crop')}>+ Add 2nd Crop</button>
                  )}
                </>
              ) : (
                <button className="btn-filled" onClick={() => navigate('/add-crop')}>+ Add Crop</button>
              )}
            </div>

            {selectedCrop && (
              <div className="progress-container">
                <svg className="progress-ring" width="140" height="140" viewBox="0 0 140 140">
                  <circle className="progress-bg" cx="70" cy="70" r="60"></circle>
                  <circle className="progress-fill" cx="70" cy="70" r="60" style={{strokeDasharray: 377, strokeDashoffset: 377 * (1 - progressPercentage / 100)}}></circle>
                </svg>
                <div className="progress-text">
                  <div className="progress-value" style={{color: 'var(--neon-green)'}}>{progressPercentage}%</div>
                  <div className="progress-sub">Day {daysPassed}/{selectedCrop.total_duration_days}</div>
                </div>
              </div>
            )}
          </div>

          {/* TODAY'S WORK CARD */}
          {selectedCrop && currentStage && (
            <div className="neo-card" style={{padding: 0}}>
              <div style={{padding: '24px'}}>
                <div className="section-title-wrap">
                  <div>
                    <h3 className="section-title">Today's Work</h3>
                    <div className="section-sub">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div className="day-pill">Day {daysPassed}</div>
                </div>
              </div>
              
              <div className="task-list">
                {(() => {
                  const sortedSubsteps = currentStage.substeps.map((sub, i) => {
                    let ai = null;
                    if (dynamicSchedule && Array.isArray(dynamicSchedule)) ai = dynamicSchedule.find(s => s.task === sub);
                    return { sub, i, ai, targetDay: ai ? ai.relative_day : i };
                  }).sort((a, b) => a.targetDay - b.targetDay);
                  
                  return sortedSubsteps.map((item, idx) => {
                    const isChecked = substepStatus[`${currentStage.stage_id}_${item.i}`];
                    // The first incomplete task is treated as "Active" 
                    const firstIncompleteIdx = sortedSubsteps.findIndex(s => !substepStatus[`${currentStage.stage_id}_${s.i}`]);
                    const isActive = idx === firstIncompleteIdx;
                    
                    return (
                      <div key={idx} className={`task-item ${isActive ? 'active' : ''}`} style={{opacity: isChecked ? 0.5 : 1}}>
                        <div className="task-left">
                          <div className={`task-checkbox ${isChecked ? 'checked' : ''}`} onClick={() => toggleSubstep(currentStage.stage_id, item.i)}>
                             {isChecked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0A0D0B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </div>
                          <div className="task-content">
                            <h4 style={{textDecoration: isChecked ? 'line-through' : 'none'}}>
                              {item.sub} 
                              {isActive && <span className="high-badge">HIGH</span>}
                            </h4>
                            {isActive && item.ai && (
                              <>
                                <div className="task-desc">{item.ai.reason}</div>
                                <div className="sys-rec">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
                                  System Recommendation
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="task-right">
                          <div className="task-day">Day {item.ai ? item.ai.relative_day : '?'} of {currentStage.duration_days}</div>
                          {isActive && <div className="task-timing">Optimal timing</div>}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* CROP JOURNEY */}
          {selectedCrop && (
            <div className="neo-card">
               <h3 className="section-title" style={{marginBottom: '32px'}}>Crop Journey</h3>
               
               <div className="pipeline-wrap">
                 <div className="pipeline-line"></div>
                 {selectedCrop.stages.map((stage, idx) => {
                    const status = stage.stage_id < currentStage?.stage_id ? 'done' : (stage.stage_id === currentStage?.stage_id ? 'active' : 'pending');
                    return (
                      <div key={idx} className={`pipeline-node-wrap ${status}`}>
                        <div className={`p-node ${status}`}>
                          {status === 'done' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          ) : stage.stage_id}
                        </div>
                        <div className="p-label" style={{maxWidth: '60px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: status==='active'?'var(--neon-green)':''}}>{stage.title}</div>
                      </div>
                    )
                 })}
               </div>

               {currentStage && (
                 <div className="stage-active-box">
                   <div className="stage-active-header">
                     <h3>{currentStage.title} — In Progress</h3>
                     <span>Day {currentStage.start_day} → Day {currentStage.end_day}</span>
                   </div>
                   <div className="stage-bar-wrap">
                     <div className="stage-bar-fill" style={{width: `${Math.min(100, Math.round(((daysPassed - currentStage.start_day + 1) / currentStage.duration_days) * 100))}%`}}></div>
                   </div>
                   <div style={{padding: '16px'}}>
                     <div style={{fontSize: '11px', color: 'var(--text-sub)', marginBottom: '16px'}}>
                       {Math.min(100, Math.round(((daysPassed - currentStage.start_day + 1) / currentStage.duration_days) * 100))}% of stage complete
                     </div>
                     
                     <div className="sb-task-list">
                        {currentStage.substeps.map((sub, i) => {
                          let ai = null;
                          if (dynamicSchedule && Array.isArray(dynamicSchedule)) ai = dynamicSchedule.find(s => s.task === sub);
                          const isChecked = substepStatus[`${currentStage.stage_id}_${i}`];
                          return (
                            <div key={i} className="task-item" style={{borderBottom: 'none', padding: '4px 0', opacity: isChecked ? 0.3 : 1}}>
                              <div className="task-left">
                                <div className={`task-checkbox ${isChecked ? 'checked' : ''}`} onClick={() => toggleSubstep(currentStage.stage_id, i)} style={{width: '16px', height: '16px'}}></div>
                                <div className="task-content">
                                  <h4 style={{fontSize: '13px', margin: 0}}>{sub}</h4>
                                </div>
                              </div>
                              <div className="task-right"><div className="task-day">Day {ai?.relative_day || '?'}/{currentStage.duration_days}</div></div>
                            </div>
                          );
                        })}
                     </div>
                   </div>
                 </div>
               )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column">
          
          {/* WEATHER CENTER */}
          <div className="neo-card">
            <div className="weather-header">
              <div>
                <h3>Weather Center</h3>
                <p>{profile?.location || 'Hyderabad, TG'}</p>
              </div>
              <div className="live-badge">
                <div className="live-dot"></div> Live
              </div>
            </div>
            
            <div className="weather-grid-4">
              <div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color: 'var(--danger-red)'}}><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
                <div className="w-stat-val">28°C</div>
                <div className="w-stat-lbl">TEMP</div>
              </div>
              <div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color: 'var(--teal-blue)'}}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                <div className="w-stat-val">72%</div>
                <div className="w-stat-lbl">HUMID</div>
              </div>
              <div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color: 'var(--neon-green)'}}><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
                <div className="w-stat-val">12</div>
                <div className="w-stat-lbl">WIND</div>
              </div>
              <div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color: '#8b5cf6'}}><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/></svg>
                <div className="w-stat-val">10%</div>
                <div className="w-stat-lbl">RAIN</div>
              </div>
            </div>

            <div className="forecast-grid">
              <div className="f-day">
                Mon<br/>
                <svg width="16" height="16" style={{margin: '4px 0'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                <br/><span className="f-val">29°C</span>
              </div>
              <div className="f-day">
                Tue<br/>
                <svg width="16" height="16" style={{margin: '4px 0', color: 'var(--warning-yellow)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                <br/><span className="f-val">31°C</span>
              </div>
              <div className="f-day">
                Wed<br/>
                <svg width="16" height="16" style={{margin: '4px 0'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                <br/><span className="f-val">26°C</span>
              </div>
            </div>

            <div className="ai-advisory-box">
              <div className="ai-adv-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                AI ADVISORY
              </div>
              <div className="ai-adv-desc">{dailyQuote || 'Avoid fertilizer application in the afternoon. High sun intensity reduces effectiveness. Increase irrigation today.'}</div>
            </div>
          </div>

          {/* PROFIT SNAPSHOT */}
          {selectedCrop && (
            <div className="neo-card profit-snapshot">
              <h3>Profit Snapshot</h3>
              <div className="profit-sub">{selectedCrop.crop_name}</div>
              
              <div className="profit-label">EXPECTED PROFIT</div>
              <div className="profit-value">₹{cropEconomics?.profit_per_acre ? (cropEconomics.profit_per_acre * (profile?.land_size ? parseFloat(profile.land_size) : 2.5)).toLocaleString('en-IN') : '2,68,000'}</div>
              
              <div className="profit-sparkline">
                <svg viewBox="0 0 300 40" style={{width: '100%', height: '100%'}}>
                  <path d="M0 30 Q 50 10, 100 25 T 200 15 T 300 10" fill="none" stroke="var(--neon-green)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0 30 Q 50 10, 100 25 T 200 15 T 300 10 L 300 40 L 0 40 Z" fill="rgba(57,255,106,0.1)" />
                </svg>
              </div>

              <div className="profit-metrics">
                <div className="pm-box">
                  <div className="pm-label">EST. YIELD</div>
                  <div className="pm-val">{cropEconomics?.yield_qtl_per_acre ? (cropEconomics.yield_qtl_per_acre * (profile?.land_size ? parseFloat(profile.land_size) : 2.5)).toFixed(0) : '200'} q</div>
                </div>
                <div className="pm-box">
                  <div className="pm-label">MKT PRICE</div>
                  <div className="pm-val">₹{cropEconomics?.market_price ? cropEconomics.market_price.toLocaleString('en-IN') : '2,300'}/q</div>
                </div>
                <div className="pm-box">
                  <div className="pm-label">MONTHLY</div>
                  <div className="pm-val">₹{cropEconomics?.profit_per_acre ? Math.round((cropEconomics.profit_per_acre * (profile?.land_size ? parseFloat(profile.land_size) : 2.5)) / (selectedCrop.total_duration_days/30)).toLocaleString('en-IN') : '44,667'}</div>
                </div>
              </div>
            </div>
          )}

          {/* UPCOMING TASKS */}
          <div className="neo-card">
            <h3 className="section-title" style={{marginBottom: '20px'}}>Upcoming Tasks</h3>
            <div className="sb-task-list">
               {upcomingTasks.length > 0 ? upcomingTasks.map((t, idx) => (
                 <div key={idx} className="sb-task">
                   <div className="sb-task-left">
                     <span className={`sb-pill ${idx===0?'amber':(idx===1?'red':'green')}`}>Day {t.day}</span>
                     <span className="sb-title">{t.task}</span>
                   </div>
                   <div className="sb-time">+{Math.max(0, t.day - daysPassed)} days</div>
                 </div>
               )) : (
                 <>
                   <div className="sb-task">
                     <div className="sb-task-left">
                       <span className="sb-pill amber">Day 58</span>
                       <span className="sb-title">Start Water Management</span>
                     </div>
                     <div className="sb-time">+15 days</div>
                   </div>
                   <div className="sb-task">
                     <div className="sb-task-left">
                       <span className="sb-pill red">Day 98</span>
                       <span className="sb-title">Start Pest & Disease Control</span>
                     </div>
                     <div className="sb-time">+55 days</div>
                   </div>
                   <div className="sb-task">
                     <div className="sb-task-left">
                       <span className="sb-pill green">Day 118</span>
                       <span className="sb-title">Start Harvesting</span>
                     </div>
                     <div className="sb-time">+75 days</div>
                   </div>
                 </>
               )}
            </div>
          </div>

          {/* AGRIBOT */}
          {!selectedCrop && AgriBot && (
            <div className="agribot-card">
              <AgriBot />
            </div>
          )}
          {selectedCrop && (
            <div className="agribot-card">
              <div className="bot-header">
                <div className="bot-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
                </div>
                <div>
                  <div className="bot-title">AgriBot AI</div>
                  <div className="bot-status">Online</div>
                </div>
              </div>
              <input type="text" className="bot-input" placeholder="I'm ready to help with crop diseases, soil..." disabled />
              <button className="bot-btn">Ask SmartAgri AI</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ActionHome;
