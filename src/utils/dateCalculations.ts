/**
 * Calculate rental days based on Excel formula logic:
 * =MAX(0, INT(H4)-INT(F4) + IF(I4 > TIME(13,30,0), 1, 0))
 * 
 * Where:
 * - F4 = pickup date + time
 * - H4 = return date + time
 * - I4 = return time
 * - If return time > 13:30, add 1 extra day
 * - Rental days must never be negative
 */
export function calculateRentalDays(
  startDate: string, // YYYY-MM-DD
  pickUpTime: string | undefined, // HH:mm
  endDate: string, // YYYY-MM-DD
  returnTime: string | undefined // HH:mm
): number {
  // Convert dates to integers (days since epoch)
  const pickupDate = new Date(startDate);
  const returnDate = new Date(endDate);
  
  const pickupDateInt = Math.floor(pickupDate.getTime() / (1000 * 60 * 60 * 24));
  const returnDateInt = Math.floor(returnDate.getTime() / (1000 * 60 * 60 * 24));
  
  // Calculate base days: INT(H4) - INT(F4)
  const baseDays = returnDateInt - pickupDateInt;
  
  // Check if return time is after 13:30
  let extraDay = 0;
  if (returnTime) {
    const [hours, minutes] = returnTime.split(':').map(Number);
    const returnTimeMinutes = hours * 60 + minutes;
    const cutoffTimeMinutes = 13 * 60 + 30; // 13:30
    
    if (returnTimeMinutes > cutoffTimeMinutes) {
      extraDay = 1;
    }
  }
  
  // MAX(0, baseDays + extraDay) - ensure never negative
  const rentalDays = Math.max(0, baseDays + extraDay);
  
  return rentalDays;
}

/**
 * Check if two datetime ranges overlap
 * Takes into account both date and time
 * Two ranges overlap if they share any common time period
 */
export function checkDateTimeOverlap(
  startDate1: string,
  pickUpTime1: string | undefined,
  endDate1: string,
  returnTime1: string | undefined,
  startDate2: string,
  pickUpTime2: string | undefined,
  endDate2: string,
  returnTime2: string | undefined
): boolean {
  // Normalize dates to compare only dates (ignore time)
  const start1DateOnly = new Date(startDate1 + 'T00:00:00');
  const end1DateOnly = new Date(endDate1 + 'T23:59:59');
  const start2DateOnly = new Date(startDate2 + 'T00:00:00');
  const end2DateOnly = new Date(endDate2 + 'T23:59:59');
  
  // Check if date ranges overlap first
  // If end1 is before start2 OR start1 is after end2, no overlap
  if (end1DateOnly.getTime() < start2DateOnly.getTime() || start1DateOnly.getTime() > end2DateOnly.getTime()) {
    return false; // No date overlap, no conflict
  }
  
  // If dates overlap, check times
  // Normalize time format (remove seconds if present, ensure HH:mm format)
  const normalizeTime = (time: string | undefined): string | undefined => {
    if (!time) return undefined;
    // Remove seconds if present (e.g., "10:00:00" -> "10:00")
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };
  
  const normPickUpTime1 = normalizeTime(pickUpTime1);
  const normReturnTime1 = normalizeTime(returnTime1);
  const normPickUpTime2 = normalizeTime(pickUpTime2);
  const normReturnTime2 = normalizeTime(returnTime2);
  
  // Create full datetime strings
  // If no time specified, use start of day for pickup and end of day for return
  const start1 = normPickUpTime1 ? `${startDate1}T${normPickUpTime1}:00` : `${startDate1}T00:00:00`;
  const end1 = normReturnTime1 ? `${endDate1}T${normReturnTime1}:00` : `${endDate1}T23:59:59`;
  
  const start2 = normPickUpTime2 ? `${startDate2}T${normPickUpTime2}:00` : `${startDate2}T00:00:00`;
  const end2 = normReturnTime2 ? `${endDate2}T${normReturnTime2}:00` : `${endDate2}T23:59:59`;
  
  // Parse dates as local time
  const start1Date = new Date(start1);
  const end1Date = new Date(end1);
  const start2Date = new Date(start2);
  const end2Date = new Date(end2);
  
  // Two ranges overlap if they share any common time period
  // Overlap occurs when: start1 < end2 AND end1 > start2
  // This means the ranges intersect at some point
  // Note: If one ends exactly when another starts (e.g., 10:00-12:00 and 12:00-14:00), 
  // they don't overlap (using < and > instead of <= and >=)
  const hasOverlap = start1Date.getTime() < end2Date.getTime() && end1Date.getTime() > start2Date.getTime();
  
  return hasOverlap;
}
