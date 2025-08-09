#To Run the migrations 

##From your project root (where package.json is), run: 

	npx sequelize-cli db:migrate 

##or, if you have Sequelize CLI installed globally: 

	sequelize db:migrate 




GET http://localhost:3000/api/service-orders
GET http://localhost:3000/api/notifications
GET http://localhost:3000/api/dashboard/home
GET http://localhost:3000/api/dashboard/analytics

GET http://localhost:3000/api/customers
GET http://localhost:3000/api/customers/1

GET http://localhost:3000/api/employees?page=1&search=John
GET http://localhost:3000/api/employees/service-type/1
GET http://localhost:3000/api/employees/email/john@example.com
GET http://localhost:3000/api/employees/name/John
GET http://localhost:3000/api/employees/phone/1234567890
