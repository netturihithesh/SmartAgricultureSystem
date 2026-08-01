const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'src', 'data', 'crop_process.json');
const cropData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const updatedData = cropData.map(crop => {
  let currentSeqDay = 1;
  const stages = crop.stages.map(stage => {
    const seq_start_day = currentSeqDay;
    const seq_end_day = currentSeqDay + stage.duration_days - 1;
    currentSeqDay = seq_end_day + 1;

    const originalDays = (stage.substeps || [])
      .map(s => (s && typeof s === 'object') ? s.day : null)
      .filter(d => typeof d === 'number');

    if (originalDays.length === 0) {
      return {
        ...stage,
        substeps: (stage.substeps || []).map((s, idx) => {
          const stepInterval = Math.max(1, Math.floor(stage.duration_days / Math.max(1, stage.substeps.length)));
          const targetDay = Math.min(seq_end_day, seq_start_day + idx * stepInterval);
          return (typeof s === 'object') ? { ...s, day: targetDay } : { task: s, day: targetDay };
        })
      };
    }

    const minOriginalDay = Math.min(...originalDays);
    const maxOriginalDay = Math.max(...originalDays);

    const substeps = (stage.substeps || []).map(sub => {
      const isObj = sub && typeof sub === 'object';
      const originalDay = isObj ? sub.day : null;

      let targetDay = seq_start_day;
      if (typeof originalDay === 'number') {
        if (maxOriginalDay === minOriginalDay) {
          targetDay = seq_start_day;
        } else {
          const ratio = (originalDay - minOriginalDay) / (maxOriginalDay - minOriginalDay);
          targetDay = seq_start_day + Math.round(ratio * (stage.duration_days - 1));
        }
      }

      // Clamp targetDay to [seq_start_day, seq_end_day] and total_duration_days
      targetDay = Math.max(seq_start_day, Math.min(seq_end_day, targetDay));
      targetDay = Math.min(crop.total_duration_days, targetDay);

      return isObj ? { ...sub, day: targetDay } : { task: sub, day: targetDay };
    });

    return { ...stage, substeps };
  });

  return { ...crop, stages };
});

fs.writeFileSync(jsonPath, JSON.stringify(updatedData, null, 2), 'utf8');
console.log('Successfully aligned crop_process.json task days with sequential stage durations!');
