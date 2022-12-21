//This module handles the endpoint for the users

// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import fs from "fs";
// import handlebars from "handlebars";
// import dotenv from "dotenv";
// import { smtpTransport } from "../services/send-email.service.js";
// dotenv.config({ path: "./global-variables.env" });

// import {
//   allowUser,
//   isUserAllowed,
//   queryUser,
//   registerUser,
//   updateUserPassword,
// } from "../services/sql.service.js";
const bcrypt = require('bcrypt')
const csv = require('@fast-csv/parse')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const handlebars = require('handlebars')
const dotenv = require('dotenv')
dotenv.config({ path: './global-variables.env' })
const { smtpTransport } = require('../services/send-email.service.js')
const uuid = require('uuid')

const {
  allowUser,
  isUserAllowed,
  queryUser,
  registerUser,
  updateUserPassword,
  superadminDb,
  clearSalarios,
  addSalario,
  createAllowedUser,
  addPayment,
  updatePayment,
  getPayments,
  updateAllowedUser,
  getPaymentByRef,
  getAllowedUser,
  updateUserInfo,
  clearTableByType,
  addToTable,
  updateAllowUser,
  getUserInfo,
} = require('../services/sql.service.js')
// SDK de Mercado Pago
const mercadopago = require('mercadopago')
// Agrega credenciales
mercadopago.configure({
  access_token:
    'APP_USR-4983551481536203-111519-1992beee26ae5a990bc339e041f38050-1004656908',
})

const preferenceOctaedro = {
  items: [
    {
      id: 'oct-signup-1',
      title: 'Pago Octaedro',
      currency_id: 'COP',
      picture_url: process.env.logoOctaedroUrl,
      description:
        'Pago para acceder a los test personalizados y la guia informacion de Octaedro',
      category_id: 'services',
      quantity: 1,
      unit_price: 120000,
    },
  ],
  back_urls: {
    success: process.env.octaedroPublicUrl + '/login',
    failure: process.env.octaedroPublicUrl + '/register',
    pending: process.env.octaedroPublicUrl,
  },
  auto_return: 'approved',
  notification_url: process.env.octaedroApiUrl + '/api/users/payments/ipn',
  statement_descriptor: 'Octaedro',
  expires: false,
}
/*
setTimeout(() => {
  let prefId = '1004656908-18f6c719-8c42-46e5-9b18-fd2cffc6ed77'
  console.log('launch find')

  mercadopago.preferences
    .findById(prefId)
    .then((res) => console.log('res pref', res))
    .catch((e) => console.log('err pref', e))

  mercadopago.merchant_orders
    .findById(prefId)
    .then((res) => console.log('res merchant_orders', res))
    .catch((e) => console.log('err merchant_orders', e))

  mercadopago.payment
    .findById(prefId)
    .then((res) => console.log('res payment', res))
    .catch((e) => console.log('err payment', e))
  let preferenceSend = {
    ...preferenceOctaedro,
    external_reference: `ref-${uuid.v4()}`,
  }
  console.log('preferenceSend', preferenceSend)
  mercadopago.preferences
    .create(preferenceSend)
    .then((res) => console.log('res create', res))
    .catch((err) => console.log('err create', err))
}, 1000)
*/
exports.allowAccess = async (req, res, next) => {
  if (!req.userData.isAdmin) {
    return res.status(401).json({
      message: 'Esta cuenta no tiene permisos administrativos.',
    })
  }
  let bodyRequest = req.body
  bodyRequest = {
    email: bodyRequest.email,
    is_admin: bodyRequest.is_admin,
    payment_success: bodyRequest.disable_payment || 1,
    user_data: JSON.stringify({
      ...bodyRequest,
      password: await bcrypt.hash(bodyRequest.password, 10),
    }),
  }
  let existUser = false
  isUserAllowed(bodyRequest.email)
    .then((existingEmail) => {
      if (existingEmail) {
        existUser = true
        return updateAllowUser(bodyRequest)
      }
      return allowUser(bodyRequest)
    })
    .then(() => {
      return fs.promises.readFile('templates/user-allowed.html', 'utf-8')
    })
    .then((html) => {
      var template = handlebars.compile(html)
      var replacements = {
        name: req.body.name,
        logoOctaedroUrl: process.env.logoOctaedroUrl,
      }
      var htmlToSend = template(replacements)
      var mailOptions = {
        from: process.env.fromEmail,
        to: bodyRequest.email,
        subject: '¡Bienvenido a Octaedro!',
        html: htmlToSend,
      }
      return smtpTransport.sendMail(mailOptions)
    })
    .then(() => {
      return res.status(201).json({
        message: `${
          existUser ? 'Ya existe, datos actualizados' : 'Acceso habilitado'
        } para este usuario.`,
      })
    })
    .catch((reason) => {
      return res.status(500).json({
        message: reason,
      })
    })
}

const updatePaymentByRef = (type, dataResponse, reqQuery, reqBody, res) => {
  getPaymentByRef(dataResponse.external_reference)
    .then(async (payment) => {
      let json_noti = JSON.parse(payment.json_noti || '[]')
      let json_queries = JSON.parse(payment.json_queries || '[]')
      json_noti.push({ query: reqQuery, body: reqBody })
      json_queries.push(dataResponse)
      await updatePayment(payment.id, {
        json_queries: JSON.stringify(json_queries),
        json_noti: JSON.stringify(json_noti),
      })
      let makeCreateUser = false
      if (type === 'merchant_order') {
        switch (dataResponse.order_status) {
          case 'paid':
            await updatePayment(payment.id, {
              status: 'success',
            })
            makeCreateUser = true
            break
          case 'payment_in_process':
            await updatePayment(payment.id, {
              status: 'waiting_pay',
            })
            break

          case 'expired':
            await updatePayment(payment.id, {
              status: 'rejected',
            })
            break

          default:
            console.log(`Order Status '${dataResponse.order_status}' not implemented`)
            break
        }
      } else if (type === 'payment') {
        switch (dataResponse.status) {
          case 'approved':
            await updatePayment(payment.id, {
              status: 'success',
            })
            makeCreateUser = true
            break
          case 'in_process':
          case 'authorized':
          case 'pending':
            await updatePayment(payment.id, {
              status: 'waiting_pay',
            })
            break

          case 'in_mediation':
          case 'rejected':
          case 'cancelled':
          case 'refunded':
          case 'charged_back':
            await updatePayment(payment.id, {
              status: 'rejected',
            })
            break

          default:
            break
        }
      }
      let allowedUser = await getAllowedUser(payment.user_allowed_id)
      if (makeCreateUser && allowedUser) {
        let existUser = await queryUser(allowedUser.email)
        if (!existUser) {
          if (allowedUser.user_data != null) {
            let userData = JSON.parse(allowedUser.user_data)
            const user = {
              id_user: null,
              name: userData.name,
              email: userData.email,
              password: userData.password,
              is_admin: allowedUser.is_admin,
              test_available: true,
              program_type: userData.program_type,
            }
            await registerUser(user)
            return res.status(200).json({
              message: 'Created user ok',
              login: true,
            })
          }
        } else {
          return res.status(200).json({
            message: 'User exist',
            login: true,
          })
        }
      }
      if (reqQuery.get_info === 'true') {
        return res.status(200).json({
          message: 'Payment found',
          login: false,
          payment,
          allowedUser,
        })
      }
    })
    .catch((errPay) => {
      console.log('errPay', errPay)
      if (reqQuery.get_info === 'true') {
        return res.status(500).json({
          message: 'Error found on find payment',
          err: errPay,
        })
      }
    })
}

exports.processPayments = (req, res, next) => {
  console.log('processPayments', req.query)
  if (req.query.topic === 'merchant_order') {
    mercadopago.merchant_orders
      .get(req.query.id)
      .then((response) => {
        updatePaymentByRef(req.query.topic, response.body, req.query, req.body, res)
      })
      .catch((err) => {
        console.log('err', err)
        if (req.query.get_info === 'true') {
          return res.status(500).json({
            message: 'Error found on find payment',
            err: err,
          })
        }
      })
  } else if (req.query.topic === 'payment') {
    mercadopago.payment
      .get(req.query.id)
      .then((response) => {
        updatePaymentByRef(req.query.topic, response.body, req.query, req.body, res)
      })
      .catch((err) => {
        console.log('err', err)
        if (req.query.get_info === 'true') {
          return res.status(500).json({
            message: 'Error found on find payment',
            err: err,
          })
        }
      })
  }
  if (req.query.get_info !== 'true') {
    return res.status(201).json({
      message: 'Notification retrived',
    })
  }
}

exports.createUser = (req, res, next) => {
  let user_queried
  let payment_created
  let create_user = false
  let new_payment = false
  let bodyRequest = req.body
  queryUser(bodyRequest.email, 'users_allowed')
    .then(async (fetchedUser) => {
      let userDataEncode = JSON.stringify({
        ...bodyRequest,
        password: await bcrypt.hash(bodyRequest.password, 10),
      })
      if (!fetchedUser) {
        return createAllowedUser({
          email: bodyRequest.email,
          user_data: userDataEncode,
          is_admin: 0,
          payment_success: 0,
        })
      }
      return updateAllowedUser(fetchedUser.id, {
        user_data: userDataEncode,
      })
    })
    .then(() => {
      return queryUser(bodyRequest.email, 'users_allowed')
    })
    .then((fetchedUser) => {
      user_queried = fetchedUser
      return queryUser(user_queried.email)
    })
    .then(async (user_exists) => {
      if (user_exists) {
        return Promise.reject('El usuario ya existe.')
      } else if (user_queried.payment_success) {
        create_user = true
      } else {
        let paysUserAllow = await getPayments(user_queried.id)
        if (paysUserAllow.length === 0) {
          new_payment = true
        } else {
          for (let pay of paysUserAllow) {
            if (pay.status === 'success') {
              create_user = true
              break
            } else if (pay.status === 'waiting_pay') {
              return pay
            } else if (pay.status === 'created') {
              new_payment = true
              return pay
            } else if (pay.status === 'pending') {
              return Promise.reject(
                'Tiene un pago en proceso, espere a que termine el procesamiento'
              )
            }
          }
          if (!create_user) {
            new_payment = true
          }
        }
        if (new_payment) {
          return addPayment({
            reference_payment: `ref-${uuid.v4()}`,
            user_allowed_id: user_queried.id,
          })
        }
      }
      if (create_user) {
        let password = await bcrypt.hash(req.body.password, 10)
        const user = {
          id_user: null,
          name: req.body.name,
          email: req.body.email,
          password: password,
          is_admin: user_queried.is_admin,
          test_available: true,
          program_type: req.body.program_type,
        }
        return registerUser(user)
      }
    })
    .then((payment) => {
      if (create_user) {
        return true
      }
      payment_created = payment
      if (new_payment) {
        let preferenceSend = {
          ...preferenceOctaedro,
          external_reference: payment.reference_payment,
        }
        return mercadopago.preferences.create(preferenceSend)
      } else {
        return { body: JSON.parse(payment.json_create) }
      }
    })
    .then((responsePay) => {
      if (create_user) {
        return true
      }
      return responsePay.body
    })
    .then(async (mercadoPayment) => {
      if (create_user) {
        return res.status(201).json({
          login: true,
          payment: false,
          message: 'Usuario creado.',
        })
      } else if (new_payment) {
        await updatePayment(payment_created.id, {
          json_create: JSON.stringify(mercadoPayment),
          mercadopago_id: mercadoPayment.id,
          status: 'waiting_pay',
        })
      }
      return res.status(201).json({
        message: 'Pago creado',
        login: false,
        payment: true,
        mercadopago_link: mercadoPayment.init_point,
      })
    })
    .catch((reason) => {
      console.log('createUser err', reason)
      return res.status(500).json({
        login: false,
        payment: false,
        message: reason,
      })
    })
}

exports.userLogin = (req, res, next) => {
  let user
  queryUser(req.body.email)
    .then((fetchedUser) => {
      user = fetchedUser
      if (!user) {
        return Promise.reject('Usuario no encontrado.')
      }
      return bcrypt.compare(req.body.password, user.password)
    })
    .then((isValidPassword) => {
      if (!isValidPassword) {
        return Promise.reject('Contraseña incorrecta, intente de nuevo.')
      }
      const token = jwt.sign(
        {
          email: user.email,
          userId: user.id_user,
          isAdmin: user.is_admin,
          name: user.name,
          testAvailable: user.test_available,
          programType: user.program_type,
        },
        process.env.jwt_key,
        { expiresIn: '1h' }
      )
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        email: user.email,
        userId: user.id_user,
        isAdmin: user.is_admin,
        name: user.name,
        testAvailable: user.test_available,
        programType: user.program_type,
        userInfo: user.user_info != null ? JSON.parse(user.user_info) : {},
      })
    })
    .catch((reason) => {
      return res.status(500).json({
        message: reason,
      })
    })
}

exports.forgotPassword = (req, res, next) => {
  let user
  queryUser(req.body.email)
    .then((fetchedUser) => {
      user = fetchedUser
      if (!user) {
        return Promise.reject('Usuario no encontrado.')
      }
      return fs.promises.readFile('templates/forgot-password.html', 'utf-8')
    })
    .then((html) => {
      const token = jwt.sign(
        {
          email: user.email,
          userId: user.id_user,
          isAdmin: user.is_admin,
          name: user.name,
          testAvailable: user.test_available,
          programType: user.program_type,
        },
        process.env.jwt_key,
        { expiresIn: '1h' }
      )
      const url = process.env.urlForgotPassword + '?token_reset=' + token
      var template = handlebars.compile(html)
      var replacements = {
        name: user.name,
        link: url,
        logoOctaedroUrl: process.env.logoOctaedroUrl,
      }
      var htmlToSend = template(replacements)
      var mailOptions = {
        from: process.env.fromEmail,
        to: user.email,
        subject: 'Restablecimiento de contraseña',
        html: htmlToSend,
      }
      return smtpTransport.sendMail(mailOptions)
    })
    .then(
      res.status(201).json({
        message: 'Email enviado.',
      })
    )
    .catch((reason) => {
      return res.status(500).json({
        message: reason,
      })
    })
}

exports.changePassword = (req, res, next) => {
  const emailValid = req.userData.email

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      return updateUserPassword(emailValid, hash)
    })
    .then(() => {
      res.status(201).json({
        message: 'Contraseña actualizada.',
      })
    })
    .catch((reason) => {
      return res.status(500).json({
        message: reason,
      })
    })
}

exports.updateUserInfo = (req, res, next) => {
  const emailValid = req.userData.email
  updateUserInfo(emailValid, req.body.info)
    .then(() => {
      res.status(200).json({
        message: 'User info actualizada',
      })
    })
    .catch((reason) => {
      return res.status(500).json({
        message: reason,
      })
    })
}

exports.getUserInfo = (req, res, next) => {
  const emailValid = req.userData.email
  getUserInfo(emailValid)
    .then((info) => {
      return res.status(200).json(JSON.parse(info.user_info||'{}'))
    })
    .catch((reason) => {
      return res.status(500).json({
        message: reason,
      })
    })
}

exports.checkAdmin = (req, res, next) => {
  const emailValid = req.userData.email

  superadminDb(emailValid)
    .then((results) => {
      return res.status(200).json({
        results: results,
      })
    })
    .catch((reason) => {
      return res.status(500).json({
        message: reason,
      })
    })
}

const subs = (string = '') => string.toUpperCase().substring(0, 1)

exports.updateDb = (req, res, next) => {
  let program_type = req.body.program_type
  switch (req.body.table) {
    case 'salarios':
      clearSalarios(program_type)
        .then(() => {
          csv
            .parseString(req.file.buffer.toString(), { headers: true })
            .on('error', (error) => console.error(error))
            .on('data', (row) => {
              addSalario(program_type, {
                id: null,
                nivel: row.nivel,
                sector: row.sector,
                industrias: row.industrias,
                cargo: row.cargo,
                salario: row.salario,
                dimensiones:
                  subs(row.dimension_1) +
                  subs(row.dimension_2) +
                  subs(row.dimension_3) +
                  subs(row.dimension_4) +
                  subs(row.dimension_5) +
                  subs(row.dimension_6),
              })
            })
            .on('end', (rowCount) => {
              console.log(`Parsed ${rowCount} rows`)
              return res.status(200).json({
                message: 'Table updated',
              })
            })
        })
        .catch((reason) => {
          return res.status(500).json({
            message: reason,
          })
        })
      break
    default:
      return res.status(404).json({
        message: 'Table not found',
      })
  }
}

const insertToDb = (req, res, table, program_type) => {
  let all_data = []
  csv
    .parseString(req.file.buffer.toString(), { headers: true })
    .on('error', (error) => console.error(error))
    .on('data', async (row) => {
      all_data.push({ table, program_type, row })
    })
    .on('end', async (rowCount) => {
      console.log(`Parsed ${rowCount} rows`)
      for (let value of all_data) {
        await addToTable(value.table, value.program_type, value.row)
      }
      return res.status(200).json({
        message: 'Table updated',
      })
    })
}

const isNull = (data) => {
  return data == undefined || data == null
}

exports.chunkUpdate = (req, res, next) => {
  let table = req.body.table
  let program_type = req.body.program_type
  let clearOldData = req.body.clear_data === 'true'

  if (isNull(req.file) || isNull(table) || isNull(program_type)) {
    return res.status(404).json({
      message: 'Any data not retrived',
    })
  }

  if (clearOldData) {
    clearTableByType(table, program_type).then(() => {
      insertToDb(req, res, table, program_type)
    })
  } else {
    insertToDb(req, res, table, program_type)
  }
}
