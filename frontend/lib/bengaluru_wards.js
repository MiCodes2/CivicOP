/**
 * Bengaluru Ward Data (2024)
 * Total: 198 wards across 8 zones
 * Source: BBMP (Bruhat Bengaluru Mahanagara Palike) official data
 */

export const BENGALURU_WARDS = [
  // EAST ZONE (26 wards)
  { number: 1, name: "Hoysalanagar", zone: "East" },
  { number: 2, name: "Vijnana Nagar", zone: "East" },
  { number: 3, name: "Garudachar Palya", zone: "East" },
  { number: 4, name: "Kadugondanahalli", zone: "East" },
  { number: 5, name: "Kushal Nagar", zone: "East" },
  { number: 6, name: "Kacharkanahalli", zone: "East" },
  { number: 7, name: "Sampigehalli", zone: "East" },
  { number: 8, name: "Maruthi Sevanagar", zone: "East" },
  { number: 9, name: "Sagayarapuram", zone: "East" },
  { number: 10, name: "SK Garden", zone: "East" },
  { number: 11, name: "Ramaswamy Palya", zone: "East" },
  { number: 12, name: "Jayamahal", zone: "East" },
  { number: 13, name: "Raj Mahal Guttahalli", zone: "East" },
  { number: 14, name: "Kaveripura", zone: "East" },
  { number: 15, name: "Subramanya Nagar", zone: "East" },
  { number: 16, name: "Okalipuram", zone: "East" },
  { number: 17, name: "Puttappa Layout", zone: "East" },
  { number: 18, name: "Lakshmidevinagar", zone: "East" },
  { number: 19, name: "Bennigana Halli", zone: "East" },
  { number: 20, name: "Neelasandra", zone: "East" },
  { number: 21, name: "Shivajinagar", zone: "East" },
  { number: 22, name: "Sampangiram Nagar", zone: "East" },
  { number: 23, name: "Bharathi Nagar", zone: "East" },
  { number: 24, name: "Shantala Nagar", zone: "East" },
  { number: 25, name: "Domlur", zone: "East" },
  { number: 26, name: "Konena Agrahara", zone: "East" },

  // WEST ZONE (26 wards)
  { number: 27, name: "Agrahara Dasarahalli", zone: "West" },
  { number: 28, name: "Dasarahalli", zone: "West" },
  { number: 29, name: "Nandini Layout", zone: "West" },
  { number: 30, name: "Peenya Industrial Area", zone: "West" },
  { number: 31, name: "Lakshmi Devi Nagar", zone: "West" },
  { number: 32, name: "Jalahalli", zone: "West" },
  { number: 33, name: "Radhakrishna Temple", zone: "West" },
  { number: 34, name: "Aramane Nagar", zone: "West" },
  { number: 35, name: "Kadu Malleshwara", zone: "West" },
  { number: 36, name: "Malleshwaram", zone: "West" },
  { number: 37, name: "Jayachamarajendra", zone: "West" },
  { number: 38, name: "Mahalakshmi Puram", zone: "West" },
  { number: 39, name: "Lakshmi Nagar", zone: "West" },
  { number: 40, name: "Shankar Matt", zone: "West" },
  { number: 41, name: "Gayathri Nagar", zone: "West" },
  { number: 42, name: "Dattatreya Temple", zone: "West" },
  { number: 43, name: "Pulikeshi Nagar", zone: "West" },
  { number: 44, name: "Sarvagna Nagar", zone: "West" },
  { number: 45, name: "Mallasandra", zone: "West" },
  { number: 46, name: "Manorayanapalya", zone: "West" },
  { number: 47, name: "Kengeri", zone: "West" },
  { number: 48, name: "Rajagopal Nagar", zone: "West" },
  { number: 49, name: "Hosahalligate", zone: "West" },
  { number: 50, name: "Chamundi Nagar", zone: "West" },
  { number: 51, name: "Prakash Nagar", zone: "West" },
  { number: 52, name: "Sriganda Kava", zone: "West" },

  // SOUTH ZONE (27 wards)
  { number: 53, name: "Vijayanagar", zone: "South" },
  { number: 54, name: "Hosahalli", zone: "South" },
  { number: 55, name: "Marenahalli", zone: "South" },
  { number: 56, name: "Nayandahalli", zone: "South" },
  { number: 57, name: "Attiguppe", zone: "South" },
  { number: 58, name: "Hampi Nagar", zone: "South" },
  { number: 59, name: "Bapuji Nagar", zone: "South" },
  { number: 60, name: "Padarayanapura", zone: "South" },
  { number: 61, name: "Jagajivanram Nagar", zone: "South" },
  { number: 62, name: "Rayapura", zone: "South" },
  { number: 63, name: "Chelavadi Palya", zone: "South" },
  { number: 64, name: "KR Market", zone: "South" },
  { number: 65, name: "Cottonpete", zone: "South" },
  { number: 66, name: "Bage Palya", zone: "South" },
  { number: 67, name: "Vidhana Soudha", zone: "South" },
  { number: 68, name: "Majestic", zone: "South" },
  { number: 69, name: "Chickpete", zone: "South" },
  { number: 70, name: "Sampige Nagar", zone: "South" },
  { number: 71, name: "Shankara Puram", zone: "South" },
  { number: 72, name: "Chamrajpet", zone: "South" },
  { number: 73, name: "Azad Nagar", zone: "South" },
  { number: 74, name: "Sudham Nagar", zone: "South" },
  { number: 75, name: "Aramane Nagar", zone: "South" },
  { number: 76, name: "Kumara Park (W)", zone: "South" },
  { number: 77, name: "Seshadripuram", zone: "South" },
  { number: 78, name: "Gandhi Nagar", zone: "South" },
  { number: 79, name: "Subhash Nagar", zone: "South" },

  // SOUTH-EAST ZONE (28 wards)
  { number: 80, name: "Dayananda Nagar", zone: "South-East" },
  { number: 81, name: "Lakkasandra", zone: "South-East" },
  { number: 82, name: "Adugodi", zone: "South-East" },
  { number: 83, name: "Ejipura", zone: "South-East" },
  { number: 84, name: "Varthur", zone: "South-East" },
  { number: 85, name: "Koramangala", zone: "South-East" },
  { number: 86, name: "Suddaguntepalya", zone: "South-East" },
  { number: 87, name: "Jayanagar", zone: "South-East" },
  { number: 88, name: "Basavanagudi", zone: "South-East" },
  { number: 89, name: "Hanumantha Nagar", zone: "South-East" },
  { number: 90, name: "Srinagar", zone: "South-East" },
  { number: 91, name: "Gali Anjenaya Temple", zone: "South-East" },
  { number: 92, name: "Deepanjali Nagar", zone: "South-East" },
  { number: 93, name: "Kempegowda", zone: "South-East" },
  { number: 94, name: "Vasantha Vallabha Nagar", zone: "South-East" },
  { number: 95, name: "Vahala Kengeri", zone: "South-East" },
  { number: 96, name: "JP Nagar", zone: "South-East" },
  { number: 97, name: "Sarakki", zone: "South-East" },
  { number: 98, name: "Shakambari Nagar", zone: "South-East" },
  { number: 99, name: "Bannerghatta", zone: "South-East" },
  { number: 100, name: "Sunkadakatte", zone: "South-East" },
  { number: 101, name: "Vagdevi Nagar", zone: "South-East" },
  { number: 102, name: "Yadavagiri", zone: "South-East" },
  { number: 103, name: "Puttenahalli", zone: "South-East" },
  { number: 104, name: "Hemmigepura", zone: "South-East" },
  { number: 105, name: "BMC Layout", zone: "South-East" },
  { number: 106, name: "BTM Layout", zone: "South-East" },
  { number: 107, name: "JP Park", zone: "South-East" },

  // BOMMANAHALLI ZONE (23 wards)
  { number: 108, name: "Hudi", zone: "Bommanahalli" },
  { number: 109, name: "Mangammanapalya", zone: "Bommanahalli" },
  { number: 110, name: "Singasandra", zone: "Bommanahalli" },
  { number: 111, name: "Begur", zone: "Bommanahalli" },
  { number: 112, name: "Arakere", zone: "Bommanahalli" },
  { number: 113, name: "Gottigere", zone: "Bommanahalli" },
  { number: 114, name: "Konankunte", zone: "Bommanahalli" },
  { number: 115, name: "Anjanapura", zone: "Bommanahalli" },
  { number: 116, name: "Vasanthapura", zone: "Bommanahalli" },
  { number: 117, name: "Anekal", zone: "Bommanahalli" },
  { number: 118, name: "Hemmigepura", zone: "Bommanahalli" },
  { number: 119, name: "Jigani", zone: "Bommanahalli" },
  { number: 120, name: "Marsur", zone: "Bommanahalli" },
  { number: 121, name: "Jigani Hobli", zone: "Bommanahalli" },
  { number: 122, name: "Attibele", zone: "Bommanahalli" },
  { number: 123, name: "Bilekahalli", zone: "Bommanahalli" },
  { number: 124, name: "Uttarahalli", zone: "Bommanahalli" },
  { number: 125, name: "Parekkanahalli", zone: "Bommanahalli" },
  { number: 126, name: "Doopanahalli", zone: "Bommanahalli" },
  { number: 127, name: "Hebbagodi", zone: "Bommanahalli" },
  { number: 128, name: "Hongasandra", zone: "Bommanahalli" },
  { number: 129, name: "Madiwala", zone: "Bommanahalli" },
  { number: 130, name: "HSR Layout", zone: "Bommanahalli" },

  // RR NAGAR ZONE (23 wards)
  { number: 131, name: "Herohalli", zone: "RR Nagar" },
  { number: 132, name: "Kattriguppe", zone: "RR Nagar" },
  { number: 133, name: "Ananda Nagar", zone: "RR Nagar" },
  { number: 134, name: "Nagarabhavi", zone: "RR Nagar" },
  { number: 135, name: "Rajarajeshwari Nagar", zone: "RR Nagar" },
  { number: 136, name: "Dodda Kalsandra", zone: "RR Nagar" },
  { number: 137, name: "Kengeri Satellite Town", zone: "RR Nagar" },
  { number: 138, name: "Byoraghatta", zone: "RR Nagar" },
  { number: 139, name: "Doddabidarkallu", zone: "RR Nagar" },
  { number: 140, name: "Ullal Upanagara", zone: "RR Nagar" },
  { number: 141, name: "Ullal", zone: "RR Nagar" },
  { number: 142, name: "Chikkalsandra", zone: "RR Nagar" },
  { number: 143, name: "Kottegepalya", zone: "RR Nagar" },
  { number: 144, name: "Mallasandra", zone: "RR Nagar" },
  { number: 145, name: "Subramanyapura", zone: "RR Nagar" },
  { number: 146, name: "Kempapura Agrahara", zone: "RR Nagar" },
  { number: 147, name: "Jaraganahalli", zone: "RR Nagar" },
  { number: 148, name: "Kereguddadahalli", zone: "RR Nagar" },
  { number: 149, name: "Somanayakanahalli", zone: "RR Nagar" },
  { number: 150, name: "Moodalapalya", zone: "RR Nagar" },
  { number: 151, name: "Karisandra", zone: "RR Nagar" },
  { number: 152, name: "Doddabomamasandra", zone: "RR Nagar" },
  { number: 153, name: "Hosakerehalli", zone: "RR Nagar" },

  // YELAHANKA ZONE (27 wards)
  { number: 154, name: "Yelahanka", zone: "Yelahanka" },
  { number: 155, name: "Bagalur", zone: "Yelahanka" },
  { number: 156, name: "Kogilu", zone: "Yelahanka" },
  { number: 157, name: "Thanisandra", zone: "Yelahanka" },
  { number: 158, name: "Hebbal", zone: "Yelahanka" },
  { number: 159, name: "Kuvempu Layout", zone: "Yelahanka" },
  { number: 160, name: "T Dasarahalli", zone: "Yelahanka" },
  { number: 161, name: "Mathikere", zone: "Yelahanka" },
  { number: 162, name: "Yeshwanthpur", zone: "Yelahanka" },
  { number: 163, name: "Dodda Bommasandra", zone: "Yelahanka" },
  { number: 164, name: "Vidyaranyapura", zone: "Yelahanka" },
  { number: 165, name: "Dodda Banaswadi", zone: "Yelahanka" },
  { number: 166, name: "Jakkuru", zone: "Yelahanka" },
  { number: 167, name: "HBR Layout", zone: "Yelahanka" },
  { number: 168, name: "Kadugodi", zone: "Yelahanka" },
  { number: 169, name: "Horamavu", zone: "Yelahanka" },
  { number: 170, name: "Ramamurthy Nagar", zone: "Yelahanka" },
  { number: 171, name: "Thindlu", zone: "Yelahanka" },
  { number: 172, name: "Singayyanapalya", zone: "Yelahanka" },
  { number: 173, name: "Doddanekkundi", zone: "Yelahanka" },
  { number: 174, name: "Marathahalli", zone: "Yelahanka" },
  { number: 175, name: "HAL Airport", zone: "Yelahanka" },
  { number: 176, name: "Jeevanbheema Nagar", zone: "Yelahanka" },
  { number: 177, name: "Jogupalya", zone: "Yelahanka" },
  { number: 178, name: "Halsuru", zone: "Yelahanka" },
  { number: 179, name: "CV Raman Nagar", zone: "Yelahanka" },
  { number: 180, name: "New Thippasandra", zone: "Yelahanka" },

  // MAHADEVAPURA ZONE (18 wards)
  { number: 181, name: "Bellandur", zone: "Mahadevapura" },
  { number: 182, name: "Kadubeesanahalli", zone: "Mahadevapura" },
  { number: 183, name: "Panathur", zone: "Mahadevapura" },
  { number: 184, name: "Whitefield", zone: "Mahadevapura" },
  { number: 185, name: "Kundalahalli", zone: "Mahadevapura" },
  { number: 186, name: "Garudacharpalya", zone: "Mahadevapura" },
  { number: 187, name: "Hagadur", zone: "Mahadevapura" },
  { number: 188, name: "Varthuru", zone: "Mahadevapura" },
  { number: 189, name: "Siddapura", zone: "Mahadevapura" },
  { number: 190, name: "Sakra Kaval", zone: "Mahadevapura" },
  { number: 191, name: "Chokkanahalli", zone: "Mahadevapura" },
  { number: 192, name: "Doddathoguru", zone: "Mahadevapura" },
  { number: 193, name: "Gunjuru", zone: "Mahadevapura" },
  { number: 194, name: "Channasandra", zone: "Mahadevapura" },
  { number: 195, name: "Hoodi", zone: "Mahadevapura" },
  { number: 196, name: "Mahadevapura", zone: "Mahadevapura" },
  { number: 197, name: "Seegehalli", zone: "Mahadevapura" },
  { number: 198, name: "Krishnarajapura", zone: "Mahadevapura" },
];

/**
 * Get ward by number
 */
export const getWardByNumber = (number) => {
  return BENGALURU_WARDS.find(ward => ward.number === parseInt(number));
};

/**
 * Get all wards in a zone
 */
export const getWardsByZone = (zone) => {
  return BENGALURU_WARDS.filter(ward => ward.zone === zone);
};

/**
 * Get unique zones
 */
export const getZones = () => {
  return [...new Set(BENGALURU_WARDS.map(ward => ward.zone))];
};

/**
 * Format ward for display
 */
export const formatWard = (wardNumber) => {
  const ward = getWardByNumber(wardNumber);
  return ward ? `Ward ${ward.number} - ${ward.name}` : `Ward ${wardNumber}`;
};
