'use strict';

const Collations = require('../const/collations.js');
const FieldType = require('../const/field-type');

/**
 * Column definition parsing
 * see https://mariadb.com/kb/en/library/resultset/#column-definition-packet
 */
module.exports.parseColumn = function(packet, clientEncoding) {
  const initial = packet.pos + 4; //skip 'def'
  packet.positionFromEnd(12); //fixed length field

  const collation = Collations.fromIndex(packet.readUInt16());
  const columnLength = packet.readUInt32();
  const columnType = packet.readUInt8();
  const flags = packet.readUInt16();
  const scale = packet.readUInt8();

  return {
    collation: collation,
    columnLength: columnLength,
    columnType: columnType,
    scale: scale,
    type: FieldType.TYPES[columnType],
    flags: flags,
    db: getStringProperty.bind(this, packet, initial, clientEncoding, 0),
    schema: getStringProperty.bind(this, packet, initial, clientEncoding, 0),
    table: getStringProperty.bind(this, packet, initial, clientEncoding, 1),
    orgTable: getStringProperty.bind(this, packet, initial, clientEncoding, 2),
    name: getStringProperty.bind(this, packet, initial, clientEncoding, 3),
    orgName: getStringProperty.bind(this, packet, initial, clientEncoding, 4)
  };
};

/**
 * Column definition parsing with extended format.
 * Extended format permit to have real format, not only stored format.
 * (example BOOLEAN and not 0/1 ...)
 * see https://mariadb.com/kb/en/library/resultset/#column-definition-packet
 */
module.exports.parseExtendedColumn = function(packet, clientEncoding) {
  packet.pos += 4; //skip 'def'
  let len = packet.skipLengthEncodedPosition();
  const db = getString.bind(this, packet, packet.pos, len, clientEncoding);
  len = packet.skipLengthEncodedPosition();
  const table = getString.bind(this, packet, packet.pos, len, clientEncoding);
  len = packet.skipLengthEncodedPosition();
  const orgTable = getString.bind(
    this,
    packet,
    packet.pos,
    len,
    clientEncoding
  );
  len = packet.skipLengthEncodedPosition();
  const name = getString.bind(this, packet, packet.pos, len, clientEncoding);
  len = packet.skipLengthEncodedPosition();
  const orgName = getString.bind(this, packet, packet.pos, len, clientEncoding);
  let stExtFormat = packet.readStringLengthEncoded(clientEncoding);
  const extFormat = new Map(
    stExtFormat.split('&').map(keyVal => keyVal.split('='))
  );

  packet.skip(1);
  const collation = Collations.fromIndex(packet.readUInt16());
  const columnLength = packet.readUInt32();
  const columnType = packet.readUInt8();
  const flags = packet.readUInt16();
  const scale = packet.readUInt8();

  return {
    collation: collation,
    columnLength: columnLength,
    columnType: columnType,
    scale: scale,
    type: FieldType.TYPES[columnType],
    flags: flags,
    db: db,
    schema: db,
    table: table,
    orgTable: orgTable,
    name: name,
    orgName: orgName,
    format: extFormat
  };
};

function getStringProperty(packet, initial, clientEncoding, index) {
  packet.forceOffset(initial);
  for (let j = 0; j < index; j++) packet.skipLengthCodedNumber();
  return packet.readStringLengthEncoded(clientEncoding);
}

function getString(packet, pos, len, encoding) {
  if (Buffer.isEncoding(encoding)) {
    return packet.buf.toString(encoding, pos - len, pos);
  }
  return Iconv.decode(packet.buf.slice(pos - len, pos), encoding);
}
