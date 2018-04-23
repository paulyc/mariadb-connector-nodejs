"use strict";

const Capabilities = require("../../const/capabilities");
const Iconv = require("iconv-lite");
const NativePasswordAuth = require("./auth/native_password_auth");

/**
 * Send Handshake response packet
 * see https://mariadb.com/kb/en/library/1-connecting-connecting/#handshake-response-packet
 *
 * @param cmd         current handshake command
 * @param out         output writer
 * @param opts        connection options
 * @param pluginName  plugin name
 * @param info        connection information
 */
module.exports.send = function send(cmd, out, opts, pluginName, info) {
  out.startPacket(cmd);
  info.defaultPluginName = pluginName;
  let authToken;
  switch (pluginName) {
    case "mysql_native_password":
    case "":
      authToken = NativePasswordAuth.encryptPassword(opts.password, info.seed);
      break;

    case "mysql_clear_password":
      if (!opts.password) {
        authToken = Buffer.alloc(0);
      } else {
        authToken = Buffer.from(opts.password);
      }
      break;

    default:
      authToken = Buffer.alloc(0);
      break;
  }

  out.writeInt32(info.clientCapabilities);
  out.writeInt32(1024 * 1024 * 1024); // max packet size
  out.writeInt8(opts.collation.index);
  for (let i = 0; i < 23; i++) {
    out.writeInt8(0);
  }

  //null encoded user
  out.writeString(opts.user || "");
  out.writeInt8(0);

  if (info.serverCapabilities & Capabilities.PLUGIN_AUTH_LENENC_CLIENT_DATA) {
    out.writeLengthCoded(authToken.length);
    out.writeBuffer(authToken, 0, authToken.length);
  } else if (info.serverCapabilities & Capabilities.SECURE_CONNECTION) {
    out.writeInt8(authToken.length);
    out.writeBuffer(authToken, 0, authToken.length);
  } else {
    out.writeBuffer(authToken, 0, authToken.length);
    out.writeInt8(0);
  }

  if (info.clientCapabilities & Capabilities.CONNECT_WITH_DB) {
    out.writeString(opts.database);
    out.writeInt8(0);
    info.database = opts.database;
  }

  if (info.clientCapabilities & Capabilities.PLUGIN_AUTH) {
    out.writeString(pluginName);
    out.writeInt8(0);
  }

  if (info.serverCapabilities & Capabilities.CONNECT_ATTRS) {
    let connectAttributes = opts.connectAttributes || {};
    let attrNames = Object.keys(connectAttributes);
    out.writeInt8(0xfc);
    let initPos = out.pos; //save position, assuming connection attributes length will be less than 2 bytes length
    out.writeInt16(0);

    const encoding = opts.collation.encoding;

    writeParam(out, "_client_name", encoding);
    writeParam(out, "MariaDB connector/Node", encoding);

    let packageJson = require("../../../package.json");
    writeParam(out, "_client_version", encoding);
    writeParam(out, packageJson.version, encoding);

    writeParam(out, "_node_version", encoding);
    writeParam(out, process.versions.node, encoding);

    for (let k = 0; k < attrNames.length; ++k) {
      writeParam(out, attrNames[k], encoding);
      writeParam(out, connectAttributes[attrNames[k]], encoding);
    }
    //write end size
    out.buf[initPos] = out.pos - initPos - 2;
    out.buf[initPos + 1] = (out.pos - initPos - 2) >> 8;
  }

  out.flushBuffer(true);
};

function writeParam(out, val, encoding) {
  let param = Buffer.isEncoding(encoding)
    ? Buffer.from(val, encoding)
    : Iconv.encode(val, encoding);
  out.writeLengthCoded(param.length);
  out.writeBuffer(param, 0, param.length);
}
