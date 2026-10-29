import Address from './address.model.js'; export const listAddresses = (userId) => Address.find({ user: userId }).lean(); export const createAddress = (data) => Address.create(data);
