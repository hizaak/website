const Photo = require("../models/Photo");

const orderedPhotoSort = {
  position: 1,
  photoDate: 1,
  createdAt: 1,
  title: 1,
};

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

const getOrderedPhotosForWork = async (workId) => {
  await normalizePhotoOrder(workId);

  return Photo.find({ workId }).sort(orderedPhotoSort);
};

const getNextPhotoPosition = async (workId) => {
  await normalizePhotoOrder(workId);

  return Photo.countDocuments({ workId });
};

const reorderWorkPhotos = async (workId, photoIds) => {
  const photos = await Photo.find({
    workId,
    _id: { $in: photoIds },
  });

  if (photos.length !== photoIds.length) {
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
  reorderWorkPhotos,
};
