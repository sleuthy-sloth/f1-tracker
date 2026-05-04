/**
 * Race Data Web Worker
 * Handles heavy telemetry processing in the background to keep the UI responsive.
 */

self.onmessage = function(e) {
  const { 
    type, 
    data: { 
      drivers, 
      locationByDriver, 
      carDataByDriver, 
      weatherData, 
      raceControlData, 
      frameIntervalMs 
    } 
  } = e.data;

  if (type === 'PROCESS_RACE_DATA') {
    try {
      const result = processRaceData(
        drivers, 
        locationByDriver, 
        carDataByDriver, 
        weatherData, 
        raceControlData, 
        frameIntervalMs
      );
      self.postMessage({ type: 'SUCCESS', result });
    } catch (error) {
      self.postMessage({ type: 'ERROR', error: error.message });
    }
  }
};

/**
 * Main processing logic (mirrors raceData.ts logic but in pure JS)
 */
function processRaceData(
  drivers, 
  locationByDriver, 
  carDataByDriver, 
  weatherData, 
  raceControlData, 
  frameIntervalMs
) {
  // 1. Collect and sort all unique timestamps
  const timestampSet = new Set();
  
  // locationByDriver is a Map-like object from the main thread
  for (const driverNumber in locationByDriver) {
    const locs = locationByDriver[driverNumber];
    for (const loc of locs) {
      const ts = new Date(loc.date).getTime();
      if (!isNaN(ts)) timestampSet.add(ts);
    }
  }

  const allTimestamps = Array.from(timestampSet).sort((a, b) => a - b);
  if (allTimestamps.length === 0) return { replayFrames: [], totalFrames: 0 };

  const startTime = allTimestamps[0];
  const endTime = allTimestamps[allTimestamps.length - 1];
  const sampledTimestamps = [];

  // 2. Sample timestamps using Binary Search
  for (let ts = startTime; ts <= endTime; ts += frameIntervalMs) {
    let low = 0;
    let high = allTimestamps.length - 1;
    let closestTimestamp = allTimestamps[0];

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (allTimestamps[mid] === ts) {
        closestTimestamp = allTimestamps[mid];
        break;
      }
      if (allTimestamps[mid] < ts) low = mid + 1;
      else high = mid - 1;
    }

    if (closestTimestamp !== ts) {
      if (high < 0) closestTimestamp = allTimestamps[low];
      else if (low >= allTimestamps.length) closestTimestamp = allTimestamps[high];
      else {
        closestTimestamp = Math.abs(allTimestamps[high] - ts) <= Math.abs(allTimestamps[low] - ts)
          ? allTimestamps[high]
          : allTimestamps[low];
      }
    }

    if (sampledTimestamps.length === 0 || sampledTimestamps[sampledTimestamps.length - 1] !== closestTimestamp) {
      sampledTimestamps.push(closestTimestamp);
    }
  }

  // 3. Build replay frames
  const replayFrames = [];
  const sortedWeather = [...weatherData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sortedRaceControl = [...raceControlData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const targetTimestamp of sampledTimestamps) {
    const driverPositions = [];

    for (const driver of drivers) {
      const dn = driver.driver_number;
      const locs = locationByDriver[dn] || [];
      const cars = carDataByDriver[dn] || [];

      const closestLoc = findClosestBinary(locs, targetTimestamp);
      const closestCar = findClosestBinary(cars, targetTimestamp);

      if (closestLoc) {
        driverPositions.push({
          driver_number: dn,
          position: 0, // Will be calculated in StrategyLab or post-processed
          x: closestLoc.x,
          y: closestLoc.y,
          speed: closestCar?.speed ?? 0,
          rpm: closestCar?.rpm ?? 0,
          gear: closestCar?.n_gear ?? 0,
          throttle: closestCar?.throttle ?? 0,
          brake: closestCar?.brake ?? 0,
          drs: closestCar?.drs ?? 0,
        });
      }
    }

    if (driverPositions.length > 0) {
      replayFrames.push({
        timestamp: targetTimestamp,
        date: new Date(targetTimestamp).toISOString(),
        lap: estimateLap(targetTimestamp, startTime),
        driver_positions: driverPositions,
        weather: findClosestBinary(sortedWeather, targetTimestamp),
        safety_car: detectSafetyCar(sortedRaceControl, targetTimestamp),
        race_control_messages: sortedRaceControl.filter(m => new Date(m.date).getTime() <= targetTimestamp)
      });
    }
  }

  return { replayFrames, totalFrames: replayFrames.length, startTime, endTime };
}

function findClosestBinary(items, targetMs) {
  if (!items || items.length === 0) return null;
  let low = 0;
  let high = items.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midMs = new Date(items[mid].date).getTime();
    if (midMs === targetMs) return items[mid];
    if (midMs < targetMs) low = mid + 1;
    else high = mid - 1;
  }

  if (high < 0) return items[low];
  if (low >= items.length) return items[high];
  
  const dHigh = Math.abs(new Date(items[high].date).getTime() - targetMs);
  const dLow = Math.abs(new Date(items[low].date).getTime() - targetMs);
  return dHigh <= dLow ? items[high] : items[low];
}

function detectSafetyCar(raceControl, targetTimestamp) {
  let phase = 'NONE';
  const relevant = raceControl.filter(m => new Date(m.date).getTime() <= targetTimestamp);
  
  for (const msg of relevant) {
    const category = (msg.category || '').toUpperCase();
    const flag = (msg.flag || '').toUpperCase();
    const message = (msg.message || '').toUpperCase();

    if (category.includes('SAFETY CAR') || flag.includes('SCD')) phase = 'DEPLOYED';
    else if (message.includes('RETURNING')) phase = 'RETURNING';
    else if (flag.includes('SCR') || message.includes('RETURNED') || message.includes('END')) phase = 'NONE';
  }

  return phase === 'NONE' ? undefined : { status: phase.toLowerCase() };
}

function estimateLap(timestamp, startTimestamp) {
  const elapsed = (timestamp - startTimestamp) / 1000;
  return Math.floor(elapsed / 90) + 1;
}
