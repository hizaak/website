const Photo = require("../models/Photo");

const LEGACY_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

// One-off migration: photo dates used to be stored as "DD/MM/YYYY" strings.
// Goes through the raw collection, since Mongoose would read such a string
// as a US date (12/03/2021 as December 3rd). Must run before the API serves
// requests.
const migratePhotoDates = async () => {
  const photos = await Photo.collection
    .find({ photoDate: { $type: "string" } }, { projection: { photoDate: 1 } })
    .toArray();

  if (!photos.length) {
    return;
  }

  let migrated = 0;

  for (const photo of photos) {
    const match = LEGACY_DATE.exec(photo.photoDate.trim());
    const date = match && new Date(Date.UTC(match[3], match[2] - 1, match[1]));

    // Same check as the API: 31/02/2021 would otherwise roll over to March.
    if (!date || date.getUTCDate() !== Number(match[1]) || date.getUTCMonth() !== match[2] - 1) {
      console.warn(`Photo date migration: unreadable date "${photo.photoDate}" on photo ${photo._id}.`);
      continue;
    }

    await Photo.collection.updateOne({ _id: photo._id }, { $set: { photoDate: date } });
    migrated++;
  }

  console.log(`Photo date migration: ${migrated}/${photos.length} date(s) converted.`);
};

module.exports = { migratePhotoDates };
