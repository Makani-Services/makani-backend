import * as moment from 'moment';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

export const API_URL =
  process.env.NODE_ENV == 'production'
    ? 'https://makani.services'
    : process.env.NODE_ENV == 'staging'
    ? 'https://test.makani.services'
    : 'http://localhost:5000';

export const FRONTEND_URL =
  process.env.NODE_ENV == 'production'
    ? 'https://makani.services'
    : process.env.NODE_ENV == 'staging'
    ? 'https://test.makani.services'
    : 'http://localhost:3000';

export const CUSTOMER_FRONTEND_URL =
  process.env.NODE_ENV == 'production'
    ? 'https://customer.makani.services'
    : process.env.NODE_ENV == 'staging'
    ? 'https://test.customer.makani.services'
    : 'http://localhost:5173';

export const WO_TYPE_LIST = ['Service call', 'Quoted job'];

export const priorityLevels = ['Critical', 'High', 'Medium', 'Non-Urgent'];

export const getFormattedHoursFromMins = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
};

export const getMinutesFromFormattedHours = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return 0;
  }
  return hours * 60 + minutes;
};

export const formatDate = (
  dateString,
  formatString = 'MM/DD/YYYY - h:mm A',
) => {
  const timestamp = Date.parse(dateString);
  return moment(timestamp).format(formatString);
};

export const getAvatarUrl = (busines, imageName) => {
  return `${API_URL}/${busines}/avatars/${imageName}`;
  // return API_URL + '/avatars/' + imageName;
};

export const getUploadUrl = (busines, fileName) => {
  return `${API_URL}/${busines}/uploads/${fileName}`;
};

export const getThumbnailUrl = (busines, fileName) => {
  return `${API_URL}/${busines}/thumbnails/${encodeURIComponent(fileName)}`;
};

export const getPoReceiptUrl = (company, fileName) => {
  return `${API_URL}/${company}/poreceipt/${fileName}`;
};

export const getSignatureUrl = (company, fileName) => {
  // return API_URL + '/signatures/' + fileName;
  return `${API_URL}/${company}/signatures/${fileName}`;
};

export const getPOReceiptPath = (company, fileName) => {
  return `./public/${company}/poreceipt/${fileName}`;
};
export const getUploadPath = (company, fileName) => {
  return `./public/${company}/uploads/${fileName}`;
};
export const getThumbnailPath = (company, fileName) => {
  return `./public/${company}/thumbnails/${fileName}`;
};
export const getSignaturePath = (company, fileName) => {
  return `./public/${company}/signatures/${fileName}`;
};
export const getServiceTicketPath = (company, fileName) => {
  return `./public/${company}/serviceticket/${fileName}`;
};

export const getRealFileName = (fileName) => {
  let fileNameParts = fileName.split('.');
  return fileName.split('-')[0] + '.' + fileNameParts.pop();
};

export const paymentItems = ['Acct Credit', 'Reimbursed', 'Company CC'];
export const ITEMS_PER_PAGE = 30;

export const getAssignedTechsNameArray = (assignedTechs) => {
  if (assignedTechs) {
    let primaryTech = assignedTechs.find((obj) => obj.roleId === 0);
    if (primaryTech) {
      let primaryTechIndex = assignedTechs.findIndex((obj) => obj.roleId === 0);
      assignedTechs.splice(primaryTechIndex, 1);
      assignedTechs.splice(0, 0, primaryTech);
    }
    let techNames = assignedTechs.map((obj) => obj.user.name);
    techNames = techNames.join(', ');
    return techNames;
  } else {
    return 'Waiting for Assignment';
  }
};

export const getPrimaryAndSecondaryTechs = (assignedTechs) => {
  if (assignedTechs) {
    let result = { primaryTech: '', secondaryTechs: '' };
    let primaryTechs = assignedTechs.filter((obj) => obj.roleId === 0);
    if (primaryTechs) {
      result.primaryTech = primaryTechs.map((obj) => obj.user.name).join(', ');
    }
    let secondaryTechs = assignedTechs.filter((obj) => obj.roleId === 1);
    if (secondaryTechs) {
      result.secondaryTechs = secondaryTechs
        .map((obj) => obj.user.name)
        .join(', ');
    }
    return result;
  } else {
    return { primaryTech: '', secondaryTechs: '' };
  }
};

export const isValidUUID = (uuid) => {
  const regex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return regex.test(uuid);
};

export const getWorkOrderStatus = (status) => {
  switch (status) {
    case 0:
      return 'REQUESTED';
    case 1:
      return 'ISSUED';
    case 2:
      return 'ENROUTE';
    case 3:
      return 'ARRIVED';
    case 4:
      return 'PARTS';
    case 5:
      return 'COMPLETE';
    case 6:
      return 'REVIEWED';
    case 100:
      return 'BILLED';
    default:
      return '';
  }
};

export const getPurchaseOrderStatus = (status) => {
  switch (status) {
    case 0:
    case 1:
      return 'REQUESTED';
    case 2:
      return 'ISSUED';
    case 3:
      return 'PURCHASED';
    case 4:
      return 'COMPLETED';
    default:
      return '';
  }
};

export const timezoneMap = {
  EST: 'America/New_York',
  CST: 'America/Chicago',
  MST: 'America/Phoenix',
  PST: 'America/Los_Angeles',
  HST: 'Pacific/Honolulu',
};

const getStartOfWeek = (date) => {
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

export const getDaysOfWeekByYearMonthWeek = (year, month, targetWeekNumber) => {
  const endOfMonth = new Date(year, month + 1, 0);

  // Go back ~6 weeks just in case
  const scanStart = getStartOfWeek(new Date(year, month, 1 - 42));
  let currentWeekStart = new Date(scanStart);
  let weekIndex = 0;

  while (currentWeekStart <= endOfMonth) {
    let daysInTargetMonth = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      if (d.getMonth() === month && d.getFullYear() === year) {
        daysInTargetMonth++;
      }
    }

    const belongsToMonth = daysInTargetMonth >= 4;

    if (belongsToMonth) {
      weekIndex++;
      if (weekIndex === targetWeekNumber) {
        const days = [];
        for (let i = 0; i < 7; i++) {
          const day = new Date(currentWeekStart);
          day.setDate(currentWeekStart.getDate() + i);
          const dayObj = { day: day.getDate() };
          days.push(dayObj);
        }
        return days;
      }
    }

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  return null; // Not found
};

export const schema = [
  {
    column: 'WO#',
    type: String,
    width: 15,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.number,
  },
  {
    column: 'Type',
    type: String,
    width: 15,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.type,
  },
  {
    column: 'Customer',
    type: String,
    width: 20,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.customer,
  },
  {
    column: 'NTE',
    type: Number,
    width: 10,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.NTE,
  },
  {
    column: 'Description',
    type: String,
    width: 50,
    wrap: true,
    align: 'left',
    alignVertical: 'center',
    value: (order) => order.description,
  },
  {
    column: 'Date Started',
    type: String,
    width: 25,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => formatDate(order.startDate, 'MM/DD/YYYY'),
  },
  {
    column: 'Technician',
    type: String,
    width: 30,
    wrap: true,
    align: 'left',
    alignVertical: 'center',
    value: (order) => order.technician,
  },
  {
    column: 'Status',
    type: String,
    width: 10,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.status,
  },
];

export const isImageFile = (fileName) => {
  const imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'tiff',
    'svg',
  ];
  const ext = fileName.split('.').pop().toLowerCase();
  return imageExtensions.includes(ext);
};

export const compressImage = async (
  filePath: string,
  outputDir: string,
  quality: number = 10,
) => {
  try {
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath).toLowerCase(); // Get file extension
    const fileBaseName = path.basename(filePath, fileExt);
    let outputFilePath = path.join(outputDir, fileName);

    // Initialize sharp instance
    let image = sharp(filePath).rotate();

    // Compress based on the file type
    switch (fileExt) {
      case '.jpg':
      case '.jpeg':
        image = image.jpeg({ quality });
        break;
      case '.png':
        image = image.png({ quality }); // PNG doesn't support lossy compression
        break;
      case '.webp':
        image = image.webp({ quality });
        break;
      case '.tiff':
        image = image.tiff({ quality });
        break;
    }

    await image.toFile(outputFilePath);

    return outputFilePath;
  } catch (error) {
    throw new Error(`Image compression failed: ${error.message}`);
  }
};

export function timeToDecimal(time) {
  let [hours, minutes] = time.split(':').map(Number);

  let mins = 0;
  if (minutes > 10 && minutes <= 20) {
    mins = 0.25;
  } else if (minutes > 20 && minutes <= 40) {
    mins = 0.5;
  } else if (minutes > 40 && minutes <= 50) {
    mins = 0.75;
  } else if (minutes > 50 && minutes < 60) {
    mins = 1;
  }
  // switch (minutes) {
  //   case 10:
  //   case 15:
  //   case 20:
  //     mins = 0.25;
  //     break;
  //   case 25:
  //   case 30:
  //   case 35:
  //     mins = 0.5;
  //     break;
  //   case 40:
  //   case 45:
  //   case 50:
  //     mins = 0.75;
  //     break;
  //   case 55:
  //     mins = 1;
  //     break;
  // }

  return hours + mins;
}

export const getFormattedTechName = (fullName) => {
  const nameParts = fullName
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    return `${lastName}, ${firstName}`;
  } else {
    return fullName;
  }
};

// export const getTechNames = (techs) => {
//   if (techs) {
//     let primaryTech = techs.find((obj) => obj.roleId === 0);
//     if (primaryTech) {
//       let currentIndex = techs.findIndex((obj) => obj.roleId === 0);
//       techs.splice(currentIndex, 1);
//       techs.splice(0, 0, primaryTech);
//     }
//     let techNames = techs.map((obj) => obj.user.name);
//     return techNames.join();
//   } else {
//     return '';
//   }
// };
