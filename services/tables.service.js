class TableService {

    init(connection) {
        this.connection = connection;
        this.createVideoTable();
    }

    createVideoTable() {
        let sql = `create table if not exists videos (
            id int not null primary key auto_increment,
            original_name varchar(255) not null,
            stored_name varchar(255) not null,
            path_video varchar(400) not null
        );`;
        this.connection.query(sql, (err, result) => {
            if(err) console.log('- não foi possível criar a tabela de vídeos! ', err.message);
            else console.log('+ criação de tabela de vídeos');
        });
    }
}

module.exports = new TableService();