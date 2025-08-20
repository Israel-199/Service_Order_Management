



GET http://localhost:3000/api/service-orders
GET http://localhost:3000/api/notifications
GET http://localhost:3000/api/dashboard/home
GET http://localhost:3000/api/dashboard/analytics

GET http://localhost:3000/api/customers
GET http://localhost:3000/api/customers/:id

GET http://localhost:3000/api/employees?page=1&limit=10
GET http://localhost:3000/api/employees/service-type/1
GET http://localhost:3000/api/employees/email/john@example.com
GET http://localhost:3000/api/employees/name/John
GET http://localhost:3000/api/employees/phone/1234567890

GET http://localhost:3000/api/notifications/
GET http://localhost:3000/api/notifications/mark-as-read/

GET http://localhost:3000/api/service-orders/
GET http://localhost:3000/api/service-orders?page=1&limit=10
GET http://localhost:3000/api/service-orders/:id
