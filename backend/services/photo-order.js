const Photo = require("../models/Photo");
const Work = require("../models/Work");

// Positions are kept contiguous (0, 1, 2...) by every write, so reads only
// sort. The other keys only break ties in data written before that.
const orderedPhotoSort = {
  position: 1,
  photoDate: 1,
  createdAt: 1,
  title: 1,
};

// Renumbers the photos of a work 0, 1, 2... in their current order. Called
// after a photo is deleted, and at startup for data written before positions
// were maintained.
const normalizePhotoOrder = async (workId) => {
  const photos = await Photo.find({ workId }).sort(orderedPhotoSort);

  const updates = photos
    .map((photo, index) => ({ photo, index }))
    .filter(({ photo, index }) => photo.position !== index)
    .map(({ photo, index }) =>
      Photo.updateOne(
        { _id: photo._id },
        { $set: { position: index } }
      )
    );

  if (updates.length) {
    await Promise.all(updates);
  }
};

const normalizeAllPhotoOrders = async () => {
  for (const work of await Work.find({}, { _id: 1 })) {
    await normalizePhotoOrder(work._id);
  }
};

const getOrderedPhotosForWork = (workId) => Photo.find({ workId }).sort(orderedPhotoSort);

const getNextPhotoPosition = (workId) => Photo.countDocuments({ workId });

// photoIds must list every photo of the work, in their new order.
const reorderWorkPhotos = async (workId, photoIds) => {
  const [matching, total] = await Promise.all([
    Photo.countDocuments({ workId, _id: { $in: photoIds } }),
    Photo.countDocuments({ workId }),
  ]);

  if (matching !== photoIds.length || total !== photoIds.length) {
    return null;
  }

  await Promise.all(
    photoIds.map((photoId, index) =>
      Photo.updateOne(
        { _id: photoId, workId },
        { $set: { position: index } }
      )
    )
  );

  return getOrderedPhotosForWork(workId);
};

module.exports = {
  getOrderedPhotosForWork,
  getNextPhotoPosition,
  normalizePhotoOrder,
  normalizeAllPhotoOrders,
  reorderWorkPhotos,
};
